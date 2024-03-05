from django.contrib import admin
from django.contrib.sessions.models import Session
from django.contrib.auth.models import Permission

# Register your models here.
admin.site.register(Session)
admin.site.register(Permission)