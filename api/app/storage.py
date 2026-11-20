# Copyright 2026 DocketHall Contributors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Object storage client: MinIO/S3 (default) or local filesystem (STORAGE_BACKEND=local)."""
import os
import shutil

from minio import Minio

from .db import _read_secret


class LocalObjectResponse:
    """File-like wrapper matching the MinIO response interface (.read/.close/.release_conn)."""

    def __init__(self, file_obj):
        self._f = file_obj

    def read(self, amt: int = -1) -> bytes:
        return self._f.read(amt)

    def stream(self, amt: int = 32 * 1024):
        while True:
            chunk = self._f.read(amt)
            if not chunk:
                break
            yield chunk

    def close(self) -> None:
        self._f.close()

    def release_conn(self) -> None:
        pass


class LocalStorageClient:
    """Drop-in local filesystem replacement for Minio when MinIO is not used."""

    def __init__(self, base_dir: str):
        self.base_dir = os.path.realpath(base_dir)
        os.makedirs(self.base_dir, exist_ok=True)

    def _resolve(self, bucket: str, object_name: str) -> str:
        clean_bucket = (bucket or "records").strip().strip("/")
        clean_key = (object_name or "").lstrip("/")
        if not clean_bucket or not clean_key:
            raise ValueError("Bucket and object_name are required")
        target = os.path.realpath(os.path.join(self.base_dir, clean_bucket, clean_key))
        root_prefix = self.base_dir.rstrip(os.sep) + os.sep
        if not target.startswith(root_prefix):
            raise ValueError(f"Unsafe storage path: {object_name!r}")
        return target

    def put_object(self, bucket_name: str, object_name: str, data, length: int = -1, content_type: str = "application/octet-stream"):
        path = self._resolve(bucket_name, object_name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as out:
            shutil.copyfileobj(data, out)

    def get_object(self, bucket_name: str, object_name: str) -> LocalObjectResponse:
        path = self._resolve(bucket_name, object_name)
        return LocalObjectResponse(open(path, "rb"))

    def remove_object(self, bucket_name: str, object_name: str) -> None:
        path = self._resolve(bucket_name, object_name)
        try:
            os.unlink(path)
        except FileNotFoundError:
            pass

    def copy_object(self, bucket_name: str, object_name: str, source) -> None:
        src_bucket = getattr(source, "bucket_name", bucket_name)
        src_key = getattr(source, "object_name", "")
        src_path = self._resolve(src_bucket, src_key)
        dst_path = self._resolve(bucket_name, object_name)
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)
        shutil.copyfile(src_path, dst_path)


_storage_client = None


def get_storage_client():
    global _storage_client
    if _storage_client is None:
        backend = os.environ.get("STORAGE_BACKEND", "auto").strip().lower()
        endpoint = os.environ.get("MINIO_ENDPOINT", "minio:9000").strip()
        if backend == "local" or (backend == "auto" and not endpoint):
            _storage_client = LocalStorageClient(os.environ.get("LOCAL_RECORDS_DIR", "/data/records"))
        else:
            secure = os.environ.get("MINIO_SECURE", "false").lower() == "true"
            access_key = _read_secret("MINIO_ACCESS_KEY_FILE", "MINIO_ACCESS_KEY")
            secret_key = _read_secret("MINIO_SECRET_KEY_FILE", "MINIO_SECRET_KEY")
            _storage_client = Minio(
                endpoint, access_key=access_key, secret_key=secret_key, secure=secure
            )
    return _storage_client
