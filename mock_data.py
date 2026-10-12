import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import Profile
from orders.models import Order, OrderItem
from products.models import Product

# create missing profiles
for u in User.objects.all():
    if not hasattr(u, 'profile'):
        Profile.objects.create(user=u, phone=f"99999999{u.id}")

# Create some orders for customers
customer = User.objects.filter(is_staff=False).first()
p = Product.objects.first()

if customer and p:
    if Order.objects.count() == 0:
        o1 = Order.objects.create(
            user=customer,
            full_name=customer.username,
            phone="9876543210",
            address_line_1="123 Main St",
            city="Kochi",
            state="Kerala",
            pincode="682001",
            subtotal=p.price,
            shipping_charge=0,
            total_amount=p.price,
            status="delivered",
            payment_status="paid"
        )
        OrderItem.objects.create(order=o1, product=p, product_name=p.name, quantity=1, price=p.price, subtotal=p.price)
        
        o2 = Order.objects.create(
            user=customer,
            full_name=customer.username,
            phone="9876543210",
            address_line_1="123 Main St",
            city="Kochi",
            state="Kerala",
            pincode="682001",
            subtotal=p.price * 2,
            shipping_charge=50,
            total_amount=p.price * 2 + 50,
            status="pending",
            payment_status="pending"
        )
        OrderItem.objects.create(order=o2, product=p, product_name=p.name, quantity=2, price=p.price, subtotal=p.price*2)

print("Mock data created!")
