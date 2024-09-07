from datetime import datetime
from django.db import models

def getHeadline(username, url, id):
    if url:
        if username:
            return f'{username} {url}'
        return url
    elif username:
        return username

    return f'Secret {id}'

# Create your models here.
class Secret(models.Model):
    username = models.CharField(max_length=255, blank=True, default='')
    password = models.CharField(max_length=255, blank=True, default='')
    url = models.CharField(max_length=255, blank=True, default='')
    totp = models.CharField(max_length=255, blank=True, default='')
    note = models.CharField(max_length=255, blank=True, default='')
    viewed = models.PositiveIntegerField(default=0)
    favorite = models.BooleanField(default=False)
    created_date = models.DateField(default=datetime.now)

    def __str__(self):
        return getHeadline(self.username, self.url, self.id)
