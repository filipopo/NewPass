from .models import Secret
from django.contrib import admin

# Register your models here.
class SecretAdmin(admin.ModelAdmin):
    list_display = ('id', 'headline', 'viewed', 'favorite', 'created_date')
    list_display_links = ('headline',)

    def headline(self, obj):
        return obj

admin.site.register(Secret, SecretAdmin)
