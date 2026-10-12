from django.db.models import Q

from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from .models import Category, Product

from .serializers import (
    CategorySerializer,
    ProductSerializer,
    AdminCategorySerializer,
    AdminProductSerializer,
)


class ProductPagination(PageNumberPagination):

    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 48


# =========================================================
# CUSTOMER APIs
# =========================================================

class CategoryListView(generics.ListAPIView):

    queryset = Category.objects.filter(
        is_active=True
    )

    serializer_class = CategorySerializer


class ProductListView(generics.ListAPIView):

    serializer_class = ProductSerializer
    pagination_class = ProductPagination

    def get_queryset(self):

        queryset = (
            Product.objects
            .filter(is_active=True)
            .select_related("category")
            .prefetch_related("images")
        )

        # Search
        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
            )

        # Category filter
        category = self.request.query_params.get("category")

        if category:
            queryset = queryset.filter(
                category__slug=category
            )

        # Featured filter
        featured = self.request.query_params.get("featured")

        if featured == "true":
            queryset = queryset.filter(
                is_featured=True
            )

        # Minimum price
        min_price = self.request.query_params.get("min_price")

        if min_price:
            try:
                queryset = queryset.filter(
                    price__gte=min_price
                )
            except (ValueError, TypeError):
                pass

        # Maximum price
        max_price = self.request.query_params.get("max_price")

        if max_price:
            try:
                queryset = queryset.filter(
                    price__lte=max_price
                )
            except (ValueError, TypeError):
                pass

        # Sorting
        sort = self.request.query_params.get("sort")

        if sort == "price_low":
            queryset = queryset.order_by("price")

        elif sort == "price_high":
            queryset = queryset.order_by("-price")

        elif sort == "newest":
            queryset = queryset.order_by("-created_at")

        elif sort == "oldest":
            queryset = queryset.order_by("created_at")

        return queryset


class ProductDetailView(generics.RetrieveAPIView):

    queryset = (
        Product.objects
        .filter(is_active=True)
        .select_related("category")
        .prefetch_related("images")
    )

    serializer_class = ProductSerializer


# =========================================================
# ADMIN CATEGORY APIs
# =========================================================

class AdminCategoryListCreateView(
    generics.ListCreateAPIView
):

    queryset = Category.objects.all()

    serializer_class = AdminCategorySerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminUser,
    ]


class AdminCategoryDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Category.objects.all()

    serializer_class = AdminCategorySerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminUser,
    ]


# =========================================================
# ADMIN PRODUCT APIs
# =========================================================

class AdminProductListCreateView(
    generics.ListCreateAPIView
):
    queryset = (
        Product.objects
        .all()
        .select_related("category")
        .prefetch_related("images")
    )

    serializer_class = AdminProductSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminUser,
    ]

    pagination_class = None

class AdminProductDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = (
        Product.objects
        .all()
        .select_related("category")
        .prefetch_related("images")
    )

    serializer_class = AdminProductSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminUser,
    ]