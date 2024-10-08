# Generated by Django 4.2.12 on 2024-09-07 09:57

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    replaces = [('webapp', '0001_initial'), ('webapp', '0002_secret_copied_secret_created_date_secret_favorite_and_more'), ('webapp', '0003_alter_secret_password_alter_secret_url_and_more'), ('webapp', '0004_alter_secret_password_alter_secret_url_and_more'), ('webapp', '0005_remove_secret_name'), ('webapp', '0006_alter_secret_updated_date'), ('webapp', '0007_rename_copied_secret_viewed'), ('webapp', '0008_remove_secret_updated_date'), ('webapp', '0009_alter_secret_note_alter_secret_password_and_more')]

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Secret',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(blank=True, default='', max_length=255)),
                ('password', models.CharField(blank=True, default='', max_length=255)),
                ('url', models.CharField(blank=True, default='', max_length=255)),
                ('viewed', models.PositiveIntegerField(default=0)),
                ('created_date', models.DateField(default=datetime.datetime.now)),
                ('favorite', models.BooleanField(default=False)),
                ('note', models.CharField(blank=True, default='', max_length=255)),
                ('totp', models.CharField(blank=True, default='', max_length=255)),
            ],
        ),
    ]
