from rest_framework import serializers
from .models import Notification
from users.serializers import PublicUserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    sender = PublicUserSerializer(read_only=True)
    idea_title = serializers.CharField(source='idea.title', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'idea', 'idea_title', 'verb', 'vote_type', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'idea', 'idea_title', 'verb', 'vote_type', 'created_at']
