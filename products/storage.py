from urllib.parse import quote

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage, Storage


class DatabaseMediaStorage(Storage):
    """Store uploaded files in the configured database in deployed environments."""

    def __init__(self):
        self.local_storage = FileSystemStorage(
            location=settings.MEDIA_ROOT,
            base_url=settings.MEDIA_URL,
        )

    @property
    def uses_database(self):
        return not settings.DEBUG

    def _save(self, name, content):
        if not self.uses_database:
            return self.local_storage.save(name, content)

        from .models import StoredMedia

        if hasattr(content, "seek"):
            content.seek(0)
        data = b"".join(content.chunks()) if hasattr(content, "chunks") else content.read()
        StoredMedia.objects.update_or_create(
            name=name,
            defaults={
                "content": data,
                "content_type": getattr(content, "content_type", None)
                or "application/octet-stream",
                "size": len(data),
            },
        )
        return name

    def _open(self, name, mode="rb"):
        if not self.uses_database:
            return self.local_storage.open(name, mode)

        from .models import StoredMedia

        media = StoredMedia.objects.get(name=name)
        return ContentFile(bytes(media.content), name=name)

    def delete(self, name):
        if not self.uses_database:
            return self.local_storage.delete(name)

        from .models import StoredMedia

        StoredMedia.objects.filter(name=name).delete()

    def exists(self, name):
        if not self.uses_database:
            return self.local_storage.exists(name)

        from .models import StoredMedia

        return StoredMedia.objects.filter(name=name).exists()

    def size(self, name):
        if not self.uses_database:
            return self.local_storage.size(name)

        from .models import StoredMedia

        return StoredMedia.objects.values_list("size", flat=True).get(name=name)

    def url(self, name):
        if not self.uses_database:
            return self.local_storage.url(name)

        return f"{settings.MEDIA_URL}{quote(name, safe='/')}"

    def path(self, name):
        if not self.uses_database:
            return self.local_storage.path(name)
        raise NotImplementedError("Database-stored media has no local filesystem path.")
