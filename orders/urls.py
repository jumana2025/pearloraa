from django.urls import path

from .views import (
    CreateOrderView,
    MyOrdersView,
    OrderDetailView,
    UpdateOrderStatusView,
    CancelOrderView,
    AdminOrderListView,
    AdminOrderDetailView
)

urlpatterns = [
    path("create/", CreateOrderView.as_view(), name="order-create"),
    path("", MyOrdersView.as_view(), name="my-orders"),
    path("admin/orders/", AdminOrderListView.as_view(), name="admin-order-list"),
    path("admin/orders/<int:pk>/", AdminOrderDetailView.as_view(), name="admin-order-detail"),
    path("<str:order_number>/", OrderDetailView.as_view(), name="order-detail"),
    path("<str:order_number>/status/", UpdateOrderStatusView.as_view(), name="order-status-update"),
    path("<str:order_number>/cancel/", CancelOrderView.as_view(), name="order-cancel"),
]
