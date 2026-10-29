from rest_framework import serializers

from .models import Category, HomePageSettings, Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductImage
        fields = [
            "id",
            "image",
            "alt_text",
        ]


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "image",
        ]


class ProductSerializer(serializers.ModelSerializer):

    category = CategorySerializer(read_only=True)

    main_image = serializers.SerializerMethodField()

    images = ProductImageSerializer(
        many=True,
        read_only=True
    )

    final_price = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "category",
            "price",
            "discount_price",
            "final_price",
            "stock",
            "main_image",
            "images",
            "is_active",
            "is_featured",
            "created_at",
            "updated_at",
        ]

    def get_main_image(self, product):
        request = self.context.get("request")

        if product.main_image:
            image_url = product.main_image.url
        else:
            first_image = product.images.first()
            image_url = first_image.image.url if first_image else None

        if image_url and request:
            return request.build_absolute_uri(image_url)

        return image_url


class AdminCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "image",
            "is_active",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "created_at",
        ]


class AdminProductImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductImage
        fields = [
            "id",
            "image",
            "alt_text",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class HomePageSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomePageSettings
        fields = ["hero_image", "editorial_image", "gifting_image", "updated_at"]
        read_only_fields = ["updated_at"]


class AdminProductSerializer(serializers.ModelSerializer):

    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
    )

    images = AdminProductImageSerializer(
        many=True,
        read_only=True,
    )

    final_price = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "category",
            "price",
            "discount_price",
            "final_price",
            "stock",
            "main_image",
            "images",
            "is_active",
            "is_featured",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "slug",
            "final_price",
            "created_at",
            "updated_at",
        ]
