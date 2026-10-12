from django.urls import path

from .views import (
    CartView,
    AddToCartView,
    UpdateCartItemView,
    RemoveCartItemView,
)


urlpatterns = [

    path(
        "",
        CartView.as_view(),
        name="cart"
    ),

    path(
        "add/",
        AddToCartView.as_view(),
        name="cart-add"
    ),

    path(
        "items/<int:pk>/",
        UpdateCartItemView.as_view(),
        name="cart-update"
    ),

    path(
        "items/<int:pk>/remove/",
        RemoveCartItemView.as_view(),
        name="cart-remove"
    ),
]