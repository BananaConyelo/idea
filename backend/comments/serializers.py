from rest_framework import serializers
from .models import Comment
from users.serializers import PublicUserSerializer


class CommentSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'idea', 'parent', 'content', 'replies', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'idea', 'created_at', 'updated_at']

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
