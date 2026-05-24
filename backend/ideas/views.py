from rest_framework import generics, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from .models import Idea, Vote
from .serializers import IdeaSerializer, IdeaCreateSerializer, VoteSerializer
from notifications.models import Notification


class IdeaListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'net_votes', 'view_count']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs = Idea.objects.all()
        if user.is_authenticated:
            qs = qs.filter(Q(is_public=True) | Q(owner=user))
        else:
            qs = qs.filter(is_public=True)

        sort = self.request.query_params.get('sort')
        if sort == 'trending':
            qs = qs.annotate(
                score=Count('votes', filter=Q(votes__vote_type='up')) + Count('views') + Count('comments')
            ).order_by('-score')
        elif sort == 'most_voted':
            qs = qs.annotate(
                upvotes=Count('votes', filter=Q(votes__vote_type='up'))
            ).order_by('-upvotes')
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return IdeaCreateSerializer
        return IdeaSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class IdeaDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = IdeaSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Idea.objects.filter(Q(is_public=True) | Q(owner=user))
        return Idea.objects.filter(is_public=True)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Track view
        from analytics.models import IdeaView
        ip = request.META.get('REMOTE_ADDR')
        if request.user.is_authenticated:
            IdeaView.objects.get_or_create(idea=instance, user=request.user, defaults={'ip_address': ip})
        else:
            IdeaView.objects.create(idea=instance, ip_address=ip)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own ideas.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own ideas.")
        instance.delete()


class VoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            idea = Idea.objects.get(pk=pk, is_public=True)
        except Idea.DoesNotExist:
            return Response({'error': 'Idea not found.'}, status=status.HTTP_404_NOT_FOUND)

        vote_type = request.data.get('vote_type')
        if vote_type not in ['up', 'down']:
            return Response({'error': 'Invalid vote_type. Use "up" or "down".'}, status=status.HTTP_400_BAD_REQUEST)

        vote, created = Vote.objects.get_or_create(user=request.user, idea=idea, defaults={'vote_type': vote_type})

        if not created:
            if vote.vote_type == vote_type:
                vote.delete()
                return Response({'status': 'vote removed'}, status=status.HTTP_200_OK)
            else:
                vote.vote_type = vote_type
                vote.save()

        # Send notification to idea owner
        if idea.owner != request.user:
            Notification.objects.create(
                recipient=idea.owner,
                sender=request.user,
                idea=idea,
                verb='voted',
                vote_type=vote_type
            )

        serializer = IdeaSerializer(idea, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyIdeasView(generics.ListAPIView):
    serializer_class = IdeaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Idea.objects.filter(owner=self.request.user)


class TrendingIdeasView(generics.ListAPIView):
    serializer_class = IdeaSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Idea.objects.filter(is_public=True).annotate(
            score=Count('votes', filter=Q(votes__vote_type='up')) + Count('views') * 0 + Count('comments')
        ).order_by('-score')[:10]
