from django.urls import path
from django.views.generic import TemplateView

from django.contrib.auth import views as auth_views

from . import views


urlpatterns = [

    path(
        '',
        views.home,
        name='home'
    ),

    path(
        'register/',
        views.register,
        name='register'
    ),

    path(
        'login/',
        auth_views.LoginView.as_view(
            template_name='marketplace/login.html'
        ),
        name='login'
    ),

    path(
        'logout/',
        auth_views.LogoutView.as_view(),
        name='logout'
    ),

    path(
        'listing/<int:pk>/',
        views.listing_detail,
        name='listing_detail'
    ),

    path(
        'listing/add/',
        views.add_listing,
        name='add_listing'
    ),

    path(
        'listing/<int:pk>/edit/',
        views.edit_listing,
        name='edit_listing'
    ),

    path(
        'listing/<int:pk>/delete/',
        views.delete_listing,
        name='delete_listing'
    ),

    path(
        'listing/<int:pk>/contact/',
        views.contact_developer,
        name='contact_developer'
    ),

    path(
        'inbox/',
        views.inbox,
        name='inbox'
    ),

    path(
        'inbox/api/',
        views.inbox_api,
        name='inbox_api'
    ),

    path(
        'sw.js',
        TemplateView.as_view(
            template_name='sw.js',
            content_type='application/javascript'
        ),
        name='sw_js'
    ),
]
