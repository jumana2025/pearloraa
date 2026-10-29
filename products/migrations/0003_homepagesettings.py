from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0002_alter_product_main_image"),
    ]

    operations = [
        migrations.CreateModel(
            name="HomePageSettings",
            fields=[
                (
                    "id",
                    models.PositiveSmallIntegerField(
                        default=1,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "hero_image",
                    models.ImageField(blank=True, null=True, upload_to="homepage/"),
                ),
                (
                    "editorial_image",
                    models.ImageField(blank=True, null=True, upload_to="homepage/"),
                ),
                (
                    "gifting_image",
                    models.ImageField(blank=True, null=True, upload_to="homepage/"),
                ),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Home page settings",
                "verbose_name_plural": "Home page settings",
            },
        ),
    ]
