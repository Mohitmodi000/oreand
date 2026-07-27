from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class WebsiteListing(models.Model):

    LISTING_TYPES = [
        ('paid', 'Paid'),
        ('free', 'Free'),
        ('student', 'Student'),
    ]

    developer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='listings'
    )

    title = models.CharField(max_length=200)

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='listings'
    )

    description = models.TextField()

    live_url = models.URLField()

    preview_image = models.ImageField(
        upload_to='website_previews/',
        blank=True,
        null=True
    )

    listing_type = models.CharField(
        max_length=20,
        choices=LISTING_TYPES,
        default='free'
    )

    starting_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Message(models.Model):

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )

    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages'
    )

    listing = models.ForeignKey(
        WebsiteListing,
        on_delete=models.CASCADE,
        related_name='messages'
    )

    message = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} → {self.receiver}"
