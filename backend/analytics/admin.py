from django.contrib import admin
from .models import IdeaView


@admin.register(IdeaView)
class IdeaViewAdmin(admin.ModelAdmin):
    list_display = ['idea', 'user', 'ip_address', 'timestamp']
    list_filter = ['timestamp']
