from django.urls import path
from .views import IdeaAnalyticsView, GlobalStatsView, LeaderboardView

urlpatterns = [
    path('idea/<int:pk>/', IdeaAnalyticsView.as_view(), name='idea-analytics'),
    path('stats/', GlobalStatsView.as_view(), name='global-stats'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]
