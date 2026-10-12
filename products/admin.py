from django.contrib import admin

from .models import Category, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "is_active",
        "created_at",
    )

    prepopulated_fields = {
        "slug": ("name",)
    }

    search_fields = (
        "name",
    )

    list_filter = (
        "is_active",
    )


class ProductImageInline(admin.TabularInline):

    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "category",
        "price",
        "discount_price",
        "stock",
        "is_active",
        "is_featured",
    )

    prepopulated_fields = {
        "slug": ("name",)
    }

    search_fields = (
        "name",
        "description",
    )

    list_filter = (
        "category",
        "is_active",
        "is_featured",
    )

    inlines = [
        ProductImageInline
    ]