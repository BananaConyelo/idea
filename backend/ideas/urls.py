from django.urls import path
from .views import IdeaListCreateView, IdeaDetailView, VoteView, MyIdeasView, TrendingIdeasView

urlpatterns = [
    path('', IdeaListCreateView.as_view(), name='idea-list-create'),
    path('<int:pk>/', IdeaDetailView.as_view(), name='idea-detail'),
    path('<int:pk>/vote/', VoteView.as_view(), name='idea-vote'),
    path('my/', MyIdeasView.as_view(), name='my-ideas'),
    path('trending/', TrendingIdeasView.as_view(), name='trending-ideas'),
]
