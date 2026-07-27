from django.contrib import admin

from .models import (
    Category,
    WebsiteListing,
    Message
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = [
        'name'
    ]

    search_fields = [
        'name'
    ]


@admin.register(WebsiteListing)
class WebsiteListingAdmin(admin.ModelAdmin):

    list_display = [
        'title',
        'developer',
        'category',
        'listing_type',
        'is_active',
        'created_at'
    ]

    list_filter = [
        'category',
        'listing_type',
        'is_active'
    ]

    search_fields = [
        'title',
        'description',
        'developer__username'
    ]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):

    list_display = [
        'sender',
        'receiver',
        'listing',
        'is_read',
        'created_at'
    ]

    list_filter = [
        'is_read',
        'created_at'
    ]
