from datetime import datetime
from .utils import getHeadline
from django.db import models

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
