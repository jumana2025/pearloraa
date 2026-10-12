from rest_framework import serializers

from .models import (
    Order,
    OrderItem,
    OrderStatusHistory,
)


class OrderItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "price",
            "subtotal",
        ]


class OrderStatusHistorySerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = OrderStatusHistory
        fields = [
            "id",
            "status",
            "note",
            "created_at",
        ]


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    status_history = OrderStatusHistorySerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "payment_status",
            "full_name",
            "phone",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "pincode",
            "subtotal",
            "shipping_charge",
            "total_amount",
            "notes",
            "items",
            "status_history",
            "created_at",
            "updated_at",
        ]