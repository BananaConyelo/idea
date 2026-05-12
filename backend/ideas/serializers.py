from rest_framework import serializers
from .models import Idea, Vote
from users.serializers import PublicUserSerializer


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'vote_type', 'created_at']
        read_only_fields = ['id', 'created_at']


class IdeaSerializer(serializers.ModelSerializer):
    owner = PublicUserSerializer(read_only=True)
    upvote_count = serializers.IntegerField(read_only=True)
    downvote_count = serializers.IntegerField(read_only=True)
    net_votes = serializers.IntegerField(read_only=True)
    view_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    user_vote = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            'id', 'owner', 'title', 'description', 'category', 'is_public',
            'upvote_count', 'downvote_count', 'net_votes', 'view_count',
            'comment_count', 'user_vote', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.votes.filter(user=request.user).first()
            return vote.vote_type if vote else None
        return None


class IdeaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idea
        fields = ['id', 'title', 'description', 'category', 'is_public', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
