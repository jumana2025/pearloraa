from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    MyProfileView,
    AdminLoginView,
    AdminDashboardView,
    AdminCustomerListView,
    AdminCustomerActivityView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", MyProfileView.as_view(), name="profile"),
    path("me/", MyProfileView.as_view(), name="user-me"),
    path("admin-login/", AdminLoginView.as_view(), name="admin-login"),
    path("admin/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin/customers/", AdminCustomerListView.as_view(), name="admin-customers"),
    path(
        "admin/customers/<int:pk>/activity/",
        AdminCustomerActivityView.as_view(),
        name="admin-customer-activity",
    ),
]
