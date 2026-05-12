from django.contrib import admin
from .models import Idea, Vote


@admin.register(Idea)
class IdeaAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'category', 'is_public', 'upvote_count', 'view_count', 'created_at']
    list_filter = ['category', 'is_public']
    search_fields = ['title', 'description', 'owner__username']


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'idea', 'vote_type', 'created_at']
    list_filter = ['vote_type']
