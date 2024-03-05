from django.urls import path
from . import views


urlpatterns = [
	path("", views.index, name="index"),
	path("auth/", views.auth, name="auth"),
	path("logout/", views.user_logout, name="user_logout"),
]