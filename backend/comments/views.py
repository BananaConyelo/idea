from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Comment
from .serializers import CommentSerializer
from notifications.models import Notification
from ideas.models import Idea


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        idea_id = self.kwargs['idea_id']
        return Comment.objects.filter(idea_id=idea_id, parent=None)

    def perform_create(self, serializer):
        idea_id = self.kwargs['idea_id']
        idea = Idea.objects.get(pk=idea_id)
        parent_id = self.request.data.get('parent')
        comment = serializer.save(user=self.request.user, idea=idea)

        # Notify idea owner (if not self)
        if idea.owner != self.request.user:
            Notification.objects.create(
                recipient=idea.owner,
                sender=self.request.user,
                idea=idea,
                verb='commented'
            )

        # Notify parent comment author for replies
        if parent_id:
            try:
                parent = Comment.objects.get(pk=parent_id)
                if parent.user != self.request.user:
                    Notification.objects.create(
                        recipient=parent.user,
                        sender=self.request.user,
                        idea=idea,
                        verb='replied'
                    )
            except Comment.DoesNotExist:
                pass


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(user=self.request.user)
