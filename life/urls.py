from __future__ import annotations

from django.urls import path

from . import views

app_name = "life"

urlpatterns = [
    path("", views.index, name="index"),
]
