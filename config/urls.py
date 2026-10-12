from django.contrib import admin
from django.urls import include, path

from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [

    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/users/",
        include("users.urls")
    ),

    path(
        "api/users/login/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),

    path(
        "api/users/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    path(
        "api/products/",
        include("products.urls")
    ),

    path(
        "api/cart/",
        include("cart.urls")
    ),

    path(
        "api/orders/",
        include("orders.urls")
    ),

    path(
        "api/wishlist/",
        include("wishlist.urls")
    ),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )