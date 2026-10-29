from django.urls import path

from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
    AdminProductListCreateView,
    AdminProductDetailView,
    AdminProductImageListCreateView,
    AdminProductImageDetailView,
    HomePageSettingsView,
    AdminHomePageSettingsView,
)


urlpatterns = [

    # Customer APIs
    path(
        "categories/",
        CategoryListView.as_view(),
        name="category-list",
    ),

    path(
        "",
        ProductListView.as_view(),
        name="product-list",
    ),

    path(
        "<int:pk>/",
        ProductDetailView.as_view(),
        name="product-detail",
    ),

    # Admin Category APIs
    path(
        "admin/categories/",
        AdminCategoryListCreateView.as_view(),
        name="admin-category-list-create",
    ),

    path(
        "admin/categories/<int:pk>/",
        AdminCategoryDetailView.as_view(),
        name="admin-category-detail",
    ),

    # Admin Product APIs
    path(
        "admin/products/",
        AdminProductListCreateView.as_view(),
        name="admin-product-list-create",
    ),

    path(
        "admin/products/<int:pk>/",
        AdminProductDetailView.as_view(),
        name="admin-product-detail",
    ),

    path(
        "admin/products/<int:product_id>/images/",
        AdminProductImageListCreateView.as_view(),
        name="admin-product-image-list-create",
    ),

    path(
        "admin/products/<int:product_id>/images/<int:pk>/",
        AdminProductImageDetailView.as_view(),
        name="admin-product-image-detail",
    ),

    path(
        "homepage/",
        HomePageSettingsView.as_view(),
        name="homepage-settings",
    ),

    path(
        "admin/homepage/",
        AdminHomePageSettingsView.as_view(),
        name="admin-homepage-settings",
    ),
]
