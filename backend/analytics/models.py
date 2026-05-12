from django.db import models
from django.conf import settings
from ideas.models import Idea


class IdeaView(models.Model):
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'View on {self.idea.title} at {self.timestamp}'
