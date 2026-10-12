from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .serializers import AdminLoginSerializer
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    LoginSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken
from .permissions import IsAdminUser

class RegisterView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "message": "Registration successful",
                    "user": {
                        "id": user.id,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "username": user.username,
                        "email": user.email,
                        "phone": user.profile.phone,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if serializer.is_valid():

            return Response(
                {
                    "message": "Login successful",
                    "access": serializer.validated_data["access"],
                    "refresh": serializer.validated_data["refresh"],
                    "user": serializer.validated_data["user"],
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class MyProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserProfileSerializer(
            request.user
        )

        return Response(
            serializer.data
        )


class AdminLoginView(APIView):

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Admin login successful.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                },
            },
            status=status.HTTP_200_OK
        )


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        from products.models import Product, Category
        from orders.models import Order
        from django.contrib.auth.models import User

        return Response({
            "total_products": Product.objects.count(),
            "total_categories": Category.objects.count(),
            "total_customers": User.objects.filter(is_staff=False, is_superuser=False).count(),
            "total_orders": Order.objects.count(),
            "message": "Welcome to Pearloraa Admin Dashboard",
            "admin": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
            }
        })

from .serializers import AdminCustomerSerializer
from django.contrib.auth.models import User

class AdminCustomerListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        customers = User.objects.filter(is_superuser=False, is_staff=False).order_by('-date_joined')
        serializer = AdminCustomerSerializer(customers, many=True)
        return Response(serializer.data)


class AdminCustomerActivityView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk):
        from cart.models import Cart
        from cart.serializers import CartSerializer
        from orders.models import Order
        from orders.serializers import OrderSerializer
        from wishlist.models import Wishlist
        from wishlist.serializers import WishlistSerializer

        customer = get_object_or_404(
            User.objects.filter(is_superuser=False, is_staff=False),
            pk=pk,
        )
        cart = Cart.objects.filter(user=customer).first()
        wishlist = Wishlist.objects.filter(user=customer).first()
        orders = (
            Order.objects.filter(user=customer)
            .prefetch_related("items", "status_history")
            .order_by("-created_at")
        )

        return Response({
            "cart": (
                CartSerializer(cart, context={"request": request}).data
                if cart
                else {"items": [], "total": "0.00"}
            ),
            "wishlist": (
                WishlistSerializer(
                    wishlist,
                    context={"request": request},
                ).data
                if wishlist
                else {"items": []}
            ),
            "orders": OrderSerializer(orders, many=True).data,
        })

from products.models import Product, Category
from orders.models import Order
from django.contrib.auth.models import User
