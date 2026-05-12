from django.db import models
from django.conf import settings


CATEGORY_CHOICES = [
    ('tech', 'Technology'),
    ('health', 'Health'),
    ('finance', 'Finance'),
    ('education', 'Education'),
    ('environment', 'Environment'),
    ('social', 'Social'),
    ('entertainment', 'Entertainment'),
    ('ecommerce', 'E-Commerce'),
    ('other', 'Other'),
]

VOTE_CHOICES = [
    ('up', 'Upvote'),
    ('down', 'Downvote'),
]


class Idea(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ideas')
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def upvote_count(self):
        return self.votes.filter(vote_type='up').count()

    @property
    def downvote_count(self):
        return self.votes.filter(vote_type='down').count()

    @property
    def net_votes(self):
        return self.upvote_count - self.downvote_count

    @property
    def view_count(self):
        return self.views.count()

    @property
    def comment_count(self):
        return self.comments.count()


class Vote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='votes')
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='votes')
    vote_type = models.CharField(max_length=4, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'idea')

    def __str__(self):
        return f'{self.user.username} {self.vote_type}voted {self.idea.title}'
