from django.urls import path

from .views import (
    WishlistView,
    AddToWishlistView,
    RemoveWishlistItemView,
)


urlpatterns = [
    path(
        "",
        WishlistView.as_view(),
        name="wishlist"
    ),
    path(
        "add/",
        AddToWishlistView.as_view(),
        name="wishlist-add"
    ),
    path(
        "items/<int:pk>/remove/",
        RemoveWishlistItemView.as_view(),
        name="wishlist-remove"
    ),
]