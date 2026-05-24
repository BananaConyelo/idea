from django.db import models
from django.conf import settings
from ideas.models import Idea


class Notification(models.Model):
    VERB_CHOICES = [
        ('commented', 'Commented on your idea'),
        ('voted', 'Voted on your idea'),
        ('replied', 'Replied to your comment'),
    ]

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_notifications')
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='notifications')
    verb = models.CharField(max_length=20, choices=VERB_CHOICES)
    vote_type = models.CharField(max_length=4, choices=[('up', 'Upvote'), ('down', 'Downvote')], null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.sender.username} {self.verb} – {self.idea.title}'
