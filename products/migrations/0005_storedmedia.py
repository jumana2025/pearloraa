from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0004_alter_product_description"),
    ]

    operations = [
        migrations.CreateModel(
            name="StoredMedia",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=500, unique=True)),
                ("content", models.BinaryField()),
                (
                    "content_type",
                    models.CharField(
                        default="application/octet-stream",
                        max_length=100,
                    ),
                ),
                ("size", models.PositiveBigIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "stored media file",
                "verbose_name_plural": "stored media files",
            },
        ),
    ]
