from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase

from cart.models import Cart, CartItem
from orders.models import Order, OrderItem
from products.models import Product
from .models import Profile
from wishlist.models import Wishlist, WishlistItem


class RegistrationTests(APITestCase):
    def setUp(self):
        self.payload = {
            "first_name": "Pearl",
            "last_name": "Customer",
            "username": "pearl-customer",
            "email": "pearl@example.com",
            "phone": "9876543210",
            "password": "secure-test-password",
            "confirm_password": "secure-test-password",
        }
        self.url = reverse("register")

    def test_registration_creates_user_and_profile(self):
        response = self.client.post(
            self.url,
            self.payload,
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username=self.payload["username"])
        self.assertTrue(user.check_password(self.payload["password"]))
        self.assertEqual(user.profile.phone, self.payload["phone"])
        self.assertEqual(response.data["user"]["email"], self.payload["email"])

    def test_registration_rejects_duplicate_email(self):
        User.objects.create_user(
            username="existing-customer",
            email=self.payload["email"],
            password="secure-test-password",
        )

        response = self.client.post(
            self.url,
            self.payload,
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

    def test_registration_rejects_duplicate_phone_without_server_error(self):
        existing_user = User.objects.create_user(
            username="existing-customer",
            email="existing@example.com",
            password="secure-test-password",
        )
        existing_user.profile.phone = self.payload["phone"]
        existing_user.profile.save(update_fields=["phone"])

        response = self.client.post(
            self.url,
            self.payload,
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("phone", response.data)
        self.assertEqual(User.objects.count(), 1)

    def test_registration_rejects_mismatched_passwords(self):
        self.payload["confirm_password"] = "different-password"

        response = self.client.post(
            self.url,
            self.payload,
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("confirm_password", response.data)


class LoginWithoutProfileTests(APITestCase):
    def test_login_creates_a_missing_profile_instead_of_returning_500(self):
        User.objects.create_user(
            username="another-customer",
            email="another@example.com",
            password="another-test-password",
        )
        user = User.objects.create_user(
            username="legacy-customer",
            email="legacy@example.com",
            password="secure-test-password",
        )
        Profile.objects.filter(user=user).delete()

        response = self.client.post(
            reverse("login"),
            {
                "login": user.email,
                "password": "secure-test-password",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["phone"], "")
        self.assertTrue(Profile.objects.filter(user=user).exists())


class AdminCustomerActivityTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            password="test-password",
            is_staff=True,
        )
        self.admin.profile.phone = "1111111111"
        self.admin.profile.save(update_fields=["phone"])
        self.customer = User.objects.create_user(
            username="customer",
            password="test-password",
        )
        self.url = reverse(
            "admin-customer-activity",
            kwargs={"pk": self.customer.pk},
        )

    def test_admin_can_view_customer_activity(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["cart"]["items"], [])
        self.assertEqual(response.data["wishlist"]["items"], [])
        self.assertEqual(response.data["orders"], [])

    def test_customer_cannot_view_customer_activity(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 403)

    def test_admin_activity_includes_customer_products_and_orders(self):
        product = Product.objects.create(
            name="Pearl Ring",
            description="A test product",
            price="1200.00",
            stock=5,
            main_image="",
        )
        cart = Cart.objects.create(user=self.customer)
        CartItem.objects.create(cart=cart, product=product, quantity=2)
        wishlist = Wishlist.objects.create(user=self.customer)
        WishlistItem.objects.create(wishlist=wishlist, product=product)
        order = Order.objects.create(
            user=self.customer,
            full_name="Test Customer",
            phone="9876543210",
            address_line_1="1 Test Street",
            city="Kochi",
            state="Kerala",
            pincode="682001",
            subtotal="1200.00",
            total_amount="1200.00",
        )
        OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product.name,
            quantity=1,
            price="1200.00",
            subtotal="1200.00",
        )
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["cart"]["items"][0]["product"]["name"], "Pearl Ring")
        self.assertEqual(response.data["wishlist"]["items"][0]["product"]["name"], "Pearl Ring")
        self.assertEqual(response.data["orders"][0]["order_number"], order.order_number)
        self.assertEqual(response.data["orders"][0]["items"][0]["product_name"], "Pearl Ring")
