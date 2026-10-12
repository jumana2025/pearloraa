from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product

from .models import Cart, CartItem
from .serializers import CartSerializer


class CartView(APIView):

    permission_classes = [IsAuthenticated]

    def get_cart(self, user):

        cart, created = Cart.objects.get_or_create(
            user=user
        )

        return cart

    def get(self, request):

        cart = self.get_cart(request.user)

        serializer = CartSerializer(cart)

        return Response(serializer.data)


class AddToCartView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)

        if not product_id:
            return Response(
                {
                    "error": "product_id is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {
                    "error": "Quantity must be a valid number."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity < 1:
            return Response(
                {
                    "error": "Quantity must be at least 1."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(
            Product,
            id=product_id,
            is_active=True
        )

        if product.stock < quantity:
            return Response(
                {
                    "error": "Not enough stock available."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            product=product
        )

        if item_created:
            cart_item.quantity = quantity

        else:
            new_quantity = cart_item.quantity + quantity

            if new_quantity > product.stock:
                return Response(
                    {
                        "error": "Requested quantity exceeds available stock."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item.quantity = new_quantity

        cart_item.save()

        return Response(
            {
                "message": "Product added to cart successfully."
            },
            status=status.HTTP_200_OK
        )


class UpdateCartItemView(generics.UpdateAPIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        cart_item = get_object_or_404(
            CartItem,
            id=pk,
            cart__user=request.user
        )

        quantity = request.data.get("quantity")

        if quantity is None:
            return Response(
                {
                    "error": "Quantity is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {
                    "error": "Quantity must be a valid number."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity < 1:
            return Response(
                {
                    "error": "Quantity must be at least 1."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity > cart_item.product.stock:
            return Response(
                {
                    "error": "Requested quantity exceeds available stock."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item.quantity = quantity
        cart_item.save()

        return Response(
            {
                "message": "Cart updated successfully."
            }
        )


class RemoveCartItemView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        cart_item = get_object_or_404(
            CartItem,
            id=pk,
            cart__user=request.user
        )

        cart_item.delete()

        return Response(
            {
                "message": "Product removed from cart."
            },
            status=status.HTTP_200_OK
        )