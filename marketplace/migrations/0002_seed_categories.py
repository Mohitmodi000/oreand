from django.db import migrations

def seed_categories(apps, schema_editor):
    Category = apps.get_model('marketplace', 'Category')
    categories = ['Dairy', 'Restaurant', 'Salon', 'Gym', 'Clothing store', 'Real estate', 'Other']
    for name in categories:
        Category.objects.get_or_create(name=name)

def rollback_categories(apps, schema_editor):
    Category = apps.get_model('marketplace', 'Category')
    Category.objects.all().delete()

class Migration(migrations.Migration):

    dependencies = [
        ('marketplace', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_categories, rollback_categories),
    ]
