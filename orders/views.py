from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart

from .models import (
    Order,
    OrderItem,
    OrderStatusHistory,
)
from .serializers import OrderSerializer


class CreateOrderView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        cart = get_object_or_404(
            Cart,
            user=request.user
        )

        cart_items = cart.items.select_related(
            "product"
        ).all()

        if not cart_items.exists():
            return Response(
                {
                    "error": "Your cart is empty."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        required_fields = [
            "full_name",
            "phone",
            "address_line_1",
            "city",
            "state",
            "pincode",
        ]

        for field in required_fields:
            if not request.data.get(field):
                return Response(
                    {
                        "error": f"{field} is required."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        subtotal = Decimal("0.00")

        for cart_item in cart_items:

            if cart_item.quantity > cart_item.product.stock:
                return Response(
                    {
                        "error": (
                            f"Not enough stock for "
                            f"{cart_item.product.name}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            subtotal += (
                cart_item.product.final_price
                * cart_item.quantity
            )

        shipping_charge = Decimal("0.00")

        total_amount = (
            subtotal + shipping_charge
        )

        order = Order.objects.create(
            user=request.user,
            full_name=request.data["full_name"],
            phone=request.data["phone"],
            address_line_1=request.data[
                "address_line_1"
            ],
            address_line_2=request.data.get(
                "address_line_2",
                ""
            ),
            city=request.data["city"],
            state=request.data["state"],
            pincode=request.data["pincode"],
            subtotal=subtotal,
            shipping_charge=shipping_charge,
            total_amount=total_amount,
            notes=request.data.get("notes", ""),
        )

        for cart_item in cart_items:

            product = cart_item.product
            quantity = cart_item.quantity
            price = product.final_price

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                quantity=quantity,
                price=price,
                subtotal=price * quantity,
            )

            product.stock -= quantity
            product.save(
                update_fields=["stock"]
            )

        OrderStatusHistory.objects.create(
            order=order,
            status=Order.OrderStatus.PENDING,
            note="Order placed successfully."
        )

        cart_items.delete()

        serializer = OrderSerializer(order)

        return Response(
            {
                "message": "Order created successfully.",
                "order": serializer.data,
            },
            status=status.HTTP_201_CREATED
        )


class MyOrdersView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        orders = (
            Order.objects
            .filter(user=request.user)
            .prefetch_related(
                "items",
                "status_history"
            )
            .order_by("-created_at")
        )

        serializer = OrderSerializer(
            orders,
            many=True
        )

        return Response(serializer.data)


class OrderDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):

        order = get_object_or_404(
            Order,
            order_number=order_number,
            user=request.user
        )

        serializer = OrderSerializer(order)

        return Response(serializer.data)

class UpdateOrderStatusView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, order_number):

        if not request.user.is_staff:
            return Response(
                {
                    "error": "Only admin users can update order status."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        order = get_object_or_404(
            Order,
            order_number=order_number
        )

        new_status = request.data.get("status")
        note = request.data.get("note", "")

        valid_statuses = [
            choice[0]
            for choice in Order.OrderStatus.choices
        ]

        if new_status not in valid_statuses:
            return Response(
                {
                    "error": "Invalid order status.",
                    "valid_statuses": valid_statuses,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save(update_fields=["status", "updated_at"])

        OrderStatusHistory.objects.create(
            order=order,
            status=new_status,
            note=note
        )

        serializer = OrderSerializer(order)

        return Response(
            {
                "message": "Order status updated successfully.",
                "order": serializer.data,
            },
            status=status.HTTP_200_OK
        )

class CancelOrderView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, order_number):

        order = get_object_or_404(
            Order,
            order_number=order_number,
            user=request.user
        )

        cancellable_statuses = [
            Order.OrderStatus.PENDING,
            Order.OrderStatus.CONFIRMED,
        ]

        if order.status not in cancellable_statuses:
            return Response(
                {
                    "error": (
                        "This order can no longer be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.status == Order.OrderStatus.CANCELLED:
            return Response(
                {
                    "message": "Order is already cancelled."
                },
                status=status.HTTP_200_OK
            )

        order.status = Order.OrderStatus.CANCELLED
        order.save(
            update_fields=["status", "updated_at"]
        )

        for item in order.items.select_related("product"):

            if item.product:
                item.product.stock += item.quantity
                item.product.save(
                    update_fields=["stock"]
                )

        OrderStatusHistory.objects.create(
            order=order,
            status=Order.OrderStatus.CANCELLED,
            note="Order cancelled by customer."
        )

        serializer = OrderSerializer(order)

        return Response(
            {
                "message": "Order cancelled successfully.",
                "order": serializer.data,
            },
            status=status.HTTP_200_OK
        )

from users.permissions import IsAdminUser

class AdminOrderListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        orders = Order.objects.all().order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class AdminOrderDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        new_status = request.data.get("status")
        
        valid_statuses = [choice[0] for choice in Order.OrderStatus.choices]
        if new_status not in valid_statuses:
            return Response({"error": "Invalid order status."}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        order.save(update_fields=["status", "updated_at"])
        OrderStatusHistory.objects.create(order=order, status=new_status, note="Updated by admin")
        serializer = OrderSerializer(order)
        return Response(serializer.data)

