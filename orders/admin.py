from django.contrib import admin

from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product_name",
        "price",
        "quantity",
        "subtotal",
    )


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ("created_at",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "order_number",
        "user",
        "status",
        "payment_status",
        "total_amount",
        "created_at",
    )

    list_filter = (
        "status",
        "payment_status",
        "created_at",
    )

    search_fields = (
        "order_number",
        "user__username",
        "user__email",
        "phone",
    )

    readonly_fields = (
        "order_number",
        "subtotal",
        "total_amount",
        "created_at",
        "updated_at",
    )

    inlines = [
        OrderItemInline,
        OrderStatusHistoryInline,
    ]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        "order",
        "product_name",
        "quantity",
        "price",
        "subtotal",
    )

    search_fields = (
        "product_name",
        "order__order_number",
    )


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):

    list_display = (
        "order",
        "status",
        "note",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "order__order_number",
    )