from __future__ import annotations

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET

from .pattern_catalog import load_pattern_catalog

# Create your views here.


def index(request):
    return render(request, "life/index.html")


@require_GET
def pattern_catalog(request):
    return JsonResponse(load_pattern_catalog(), safe=False)
