from django.shortcuts import render, redirect, get_object_or_404

from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User

from django.contrib import messages

from .models import WebsiteListing, Category, Message
from .forms import (
    RegisterForm,
    WebsiteListingForm,
    MessageForm
)


def home(request):

    query = request.GET.get('q', '')

    listings = WebsiteListing.objects.filter(
        is_active=True
    ).select_related(
        'developer',
        'category'
    )

    if query:
        listings = listings.filter(
            title__icontains=query
        ) | listings.filter(
            description__icontains=query
        ) | listings.filter(
            category__name__icontains=query
        )

    categories = Category.objects.all()

    context = {
        'listings': listings,
        'categories': categories,
        'query': query,
    }

    return render(
        request,
        'marketplace/home.html',
        context
    )


def listing_detail(request, pk):

    listing = get_object_or_404(
        WebsiteListing,
        pk=pk,
        is_active=True
    )

    return render(
        request,
        'marketplace/listing_detail.html',
        {
            'listing': listing
        }
    )


def register(request):

    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':

        form = RegisterForm(request.POST)

        if form.is_valid():

            user = form.save()

            login(request, user)

            messages.success(
                request,
                'Account created successfully.'
            )

            return redirect('home')

    else:

        form = RegisterForm()

    return render(
        request,
        'marketplace/register.html',
        {
            'form': form
        }
    )


@login_required
def add_listing(request):

    if request.method == 'POST':

        form = WebsiteListingForm(
            request.POST,
            request.FILES
        )

        if form.is_valid():

            listing = form.save(commit=False)

            listing.developer = request.user

            listing.save()

            messages.success(
                request,
                'Your project has been listed.'
            )

            return redirect(
                'listing_detail',
                pk=listing.pk
            )

    else:

        form = WebsiteListingForm()

    return render(
        request,
        'marketplace/add_listing.html',
        {
            'form': form
        }
    )


@login_required
def edit_listing(request, pk):

    listing = get_object_or_404(
        WebsiteListing,
        pk=pk,
        developer=request.user
    )

    if request.method == 'POST':

        form = WebsiteListingForm(
            request.POST,
            request.FILES,
            instance=listing
        )

        if form.is_valid():

            form.save()

            return redirect(
                'listing_detail',
                pk=listing.pk
            )

    else:

        form = WebsiteListingForm(
            instance=listing
        )

    return render(
        request,
        'marketplace/edit_listing.html',
        {
            'form': form,
            'listing': listing
        }
    )


@login_required
def delete_listing(request, pk):

    listing = get_object_or_404(
        WebsiteListing,
        pk=pk,
        developer=request.user
    )

    if request.method == 'POST':

        listing.delete()

        messages.success(
            request,
            'Listing deleted.'
        )

        return redirect('home')

    return render(
        request,
        'marketplace/delete_listing.html',
        {
            'listing': listing
        }
    )


@login_required
def contact_developer(request, pk):

    listing = get_object_or_404(
        WebsiteListing,
        pk=pk
    )

    if listing.developer == request.user:

        messages.error(
            request,
            'You cannot message yourself.'
        )

        return redirect(
            'listing_detail',
            pk=pk
        )

    if request.method == 'POST':

        form = MessageForm(
            request.POST
        )

        if form.is_valid():

            msg = form.save(
                commit=False
            )

            msg.sender = request.user

            msg.receiver = listing.developer

            msg.listing = listing

            msg.save()

            messages.success(
                request,
                'Message sent successfully.'
            )

            return redirect(
                'listing_detail',
                pk=pk
            )

    else:

        form = MessageForm()

    return render(
        request,
        'marketplace/contact.html',
        {
            'form': form,
            'listing': listing
        }
    )


@login_required
def inbox(request):

    # Mark all unread received messages as read upon opening the inbox
    Message.objects.filter(
        receiver=request.user,
        is_read=False
    ).update(is_read=True)

    received_messages = Message.objects.filter(
        receiver=request.user
    ).select_related(
        'sender',
        'listing'
    ).order_by('-created_at')

    return render(
        request,
        'marketplace/inbox.html',
        {
            'messages': received_messages
        }
    )
