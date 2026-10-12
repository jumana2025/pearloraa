from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q


class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    phone = models.CharField(
        max_length=15,
        blank=True
    )

    profile_image = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["phone"],
                condition=~Q(phone=""),
                name="unique_profile_phone_when_set",
            )
        ]

    def __str__(self):
        return self.user.username