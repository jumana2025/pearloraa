import os
import uuid
from pathlib import PurePosixPath
from urllib.request import urlopen

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.exceptions import ImproperlyConfigured
from django.core.files.storage import FileSystemStorage, Storage


class PersistentMediaStorage(Storage):
    """Use Cloudinary in production when configured; keep local development simple."""

    def __init__(self):
        self.cloudinary_url = os.getenv("CLOUDINARY_URL", "").strip()
        self.local_storage = FileSystemStorage(
            location=settings.MEDIA_ROOT,
            base_url=settings.MEDIA_URL,
        )

        if self.cloudinary_url:
            import cloudinary

            cloudinary.config(cloudinary_url=self.cloudinary_url, secure=True)

    @property
    def uses_cloudinary(self):
        return bool(self.cloudinary_url)

    def _save(self, name, content):
        if not self.uses_cloudinary:
            if os.getenv("RENDER_EXTERNAL_HOSTNAME") or not settings.DEBUG:
                raise ImproperlyConfigured(
                    "Set CLOUDINARY_URL in the production environment before uploading media."
                )
            return self.local_storage.save(name, content)

        import cloudinary.uploader

        path = PurePosixPath(name)
        if hasattr(content, "seek"):
            content.seek(0)
        result = cloudinary.uploader.upload(
            content,
            folder="/".join(path.parts[:-1]),
            public_id=f"{path.stem}-{uuid.uuid4().hex[:12]}",
            resource_type="image",
            overwrite=False,
        )
        return result["public_id"]

    def _open(self, name, mode="rb"):
        if not self.uses_cloudinary:
            return self.local_storage.open(name, mode)

        return ContentFile(urlopen(self.url(name)).read(), name=name)

    def delete(self, name):
        if not self.uses_cloudinary:
            return self.local_storage.delete(name)

        import cloudinary.uploader

        cloudinary.uploader.destroy(name, resource_type="image")

    def exists(self, name):
        if not self.uses_cloudinary:
            return self.local_storage.exists(name)

        import cloudinary.api

        try:
            cloudinary.api.resource(name, resource_type="image", type="upload")
            return True
        except Exception:
            return False

    def size(self, name):
        if not self.uses_cloudinary:
            return self.local_storage.size(name)

        import cloudinary.api

        return cloudinary.api.resource(
            name,
            resource_type="image",
            type="upload",
        )["bytes"]

    def url(self, name):
        if not self.uses_cloudinary:
            return self.local_storage.url(name)

        import cloudinary

        return cloudinary.CloudinaryImage(name).build_url(secure=True)

    def path(self, name):
        if not self.uses_cloudinary:
            return self.local_storage.path(name)
        raise NotImplementedError("Cloudinary media files do not have a local filesystem path.")
