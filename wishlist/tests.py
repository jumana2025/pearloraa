from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase

from products.models import Product

from .models import WishlistItem


class WishlistIsolationTests(APITestCase):
    def setUp(self):
        self.first_user = User.objects.create_user(
            username="wishlist-first",
            password="test-password",
            email="first@example.com",
        )
        self.first_user.profile.phone = "9876500001"
        self.first_user.profile.save(update_fields=["phone"])
        self.second_user = User.objects.create_user(
            username="wishlist-second",
            password="test-password",
            email="second@example.com",
        )
        self.product = Product.objects.create(
            name="Wishlist Ring",
            description="A test product",
            price="1500.00",
            stock=4,
            main_image="",
        )

    def test_wishlist_requires_authentication(self):
        response = self.client.get(reverse("wishlist"))
        add_response = self.client.post(
            reverse("wishlist-add"),
            {"product_id": self.product.id},
            format="json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(add_response.status_code, 401)
        self.assertFalse(WishlistItem.objects.exists())

    def test_users_only_see_and_remove_their_own_wishlist_items(self):
        self.client.force_authenticate(user=self.first_user)
        add_response = self.client.post(
            reverse("wishlist-add"),
            {"product_id": self.product.id},
            format="json",
        )

        self.assertEqual(add_response.status_code, 201)
        item = WishlistItem.objects.get(
            wishlist__user=self.first_user,
            product=self.product,
        )

        self.client.force_authenticate(user=self.second_user)
        response = self.client.get(reverse("wishlist"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["items"], [])

        remove_response = self.client.delete(
            reverse("wishlist-remove", args=[item.id])
        )
        self.assertEqual(remove_response.status_code, 404)
        self.assertTrue(WishlistItem.objects.filter(pk=item.id).exists())
