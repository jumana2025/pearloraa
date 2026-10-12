from django.urls import path

from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
    AdminProductListCreateView,
    AdminProductDetailView,
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
]