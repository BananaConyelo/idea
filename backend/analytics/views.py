from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from ideas.models import Idea, Vote
from analytics.models import IdeaView
from comments.models import Comment


class IdeaAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            idea = Idea.objects.get(pk=pk, owner=request.user)
        except Idea.DoesNotExist:
            return Response({'error': 'Not found or not yours.'}, status=404)

        now = timezone.now()
        last_7_days = [(now - timedelta(days=i)).date() for i in range(6, -1, -1)]

        views_by_day = []
        for day in last_7_days:
            count = idea.views.filter(timestamp__date=day).count()
            views_by_day.append({'date': str(day), 'views': count})

        data = {
            'title': idea.title,
            'total_views': idea.view_count,
            'total_upvotes': idea.upvote_count,
            'total_downvotes': idea.downvote_count,
            'net_votes': idea.net_votes,
            'total_comments': idea.comment_count,
            'views_by_day': views_by_day,
        }
        return Response(data)


class GlobalStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        data = {
            'total_ideas': Idea.objects.filter(is_public=True).count(),
            'total_users': User.objects.count(),
            'total_votes': Vote.objects.count(),
            'total_comments': Comment.objects.count(),
            'idea_of_the_week': self._idea_of_the_week(),
        }
        return Response(data)

    def _idea_of_the_week(self):
        from ideas.serializers import IdeaSerializer
        week_ago = timezone.now() - timedelta(days=7)
        idea = Idea.objects.filter(is_public=True, created_at__gte=week_ago).annotate(
            score=Count('votes', filter=Q(votes__vote_type='up')) + Count('comments')
        ).order_by('-score').first()
        if idea:
            return {'id': idea.id, 'title': idea.title}
        return None


class LeaderboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        users = User.objects.annotate(
            total_votes=Count('ideas__votes', filter=Q(ideas__votes__vote_type='up'))
        ).order_by('-total_votes')[:10]

        leaderboard = [
            {'rank': i + 1, 'username': u.username, 'total_votes': u.total_votes, 'idea_count': u.ideas.count()}
            for i, u in enumerate(users)
        ]
        return Response(leaderboard)
