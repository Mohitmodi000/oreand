from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

from .models import WebsiteListing, Message


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
        ]


class WebsiteListingForm(forms.ModelForm):

    class Meta:
        model = WebsiteListing

        fields = [
            'title',
            'category',
            'description',
            'live_url',
            'preview_image',
            'listing_type',
            'starting_price',
            'currency',
        ]

        widgets = {
            'description': forms.Textarea(
                attrs={'rows': 5}
            ),
        }


class MessageForm(forms.ModelForm):

    class Meta:
        model = Message

        fields = [
            'message',
        ]

        widgets = {
            'message': forms.Textarea(
                attrs={
                    'rows': 5,
                    'placeholder': 'Write your message...'
                }
            )
        }
