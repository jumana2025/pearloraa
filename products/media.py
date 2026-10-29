from django.conf import settings
from django.http import Http404, HttpResponse
from django.views.static import serve as serve_static


def serve_media(request, path):
    """Serve durable database media, with local-file fallback for development."""
    from .models import StoredMedia

    media = StoredMedia.objects.filter(name=path).only("content", "content_type").first()
    if media is not None:
        response = HttpResponse(bytes(media.content), content_type=media.content_type)
        response["Cache-Control"] = "public, max-age=86400"
        return response

    try:
        return serve_static(request, path, document_root=settings.MEDIA_ROOT)
    except Http404:
        raise
