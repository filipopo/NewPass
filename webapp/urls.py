from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('secrets/', views.secrets, name='secrets'),
    path('secrets/<int:id>', views.secret, name='secret'),
    path('process_image/', views.process_image, name='process_image'),
]
