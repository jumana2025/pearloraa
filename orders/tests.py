from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase

from cart.models import Cart, CartItem
from products.models import Product

from .models import Order


class CreateOrderTests(APITestCase):
    def test_cart_checkout_creates_a_pending_order(self):
        customer = User.objects.create_user(
            username="checkout-customer",
            password="test-password",
        )
        product = Product.objects.create(
            name="Checkout Ring",
            description="A test product",
            price="1500.00",
            stock=4,
            main_image="",
        )
        cart = Cart.objects.create(user=customer)
        CartItem.objects.create(cart=cart, product=product, quantity=2)
        self.client.force_authenticate(user=customer)

        response = self.client.post(
            reverse("order-create"),
            {
                "full_name": "Test Customer",
                "phone": "9876543210",
                "address_line_1": "1 Test Street",
                "city": "Kochi",
                "state": "Kerala",
                "pincode": "682001",
                "notes": "Customization note",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["order"]["status"], Order.OrderStatus.PENDING)
        self.assertEqual(response.data["order"]["items"][0]["product_name"], "Checkout Ring")
        self.assertEqual(response.data["order"]["total_amount"], "3000.00")
        self.assertFalse(CartItem.objects.filter(cart=cart).exists())
        product.refresh_from_db()
        self.assertEqual(product.stock, 2)
