from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer
from products.models import Product


class WishlistView(APIView):
    """GET /api/wishlist/ — returns the authenticated user's wishlist."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist, context={'request': request})
        return Response(serializer.data)


class AddToWishlistView(APIView):
    """POST /api/wishlist/add/ — add a product to the wishlist."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist,
            product=product,
        )

        if not created:
            return Response(
                {'message': 'Product is already in your wishlist.'},
                status=status.HTTP_200_OK
            )

        serializer = WishlistSerializer(wishlist, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RemoveWishlistItemView(APIView):
    """DELETE /api/wishlist/items/<pk>/remove/ — remove an item from the wishlist."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            item = WishlistItem.objects.get(pk=pk, wishlist__user=request.user)
        except WishlistItem.DoesNotExist:
            return Response(
                {'error': 'Wishlist item not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        item.delete()
        return Response(
            {'message': 'Item removed from wishlist.'},
            status=status.HTTP_200_OK
        )
