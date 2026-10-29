from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0003_homepagesettings"),
    ]

    operations = [
        migrations.AlterField(
            model_name="product",
            name="description",
            field=models.TextField(blank=True),
        ),
    ]
