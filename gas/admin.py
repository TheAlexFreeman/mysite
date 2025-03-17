from django.contrib import admin

from gas.models import Fillup, Vehicle


# Register your models here.
@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("year", "make", "model", "nickname", "owner")
    list_filter = ("year", "make", "model", "owner")
    search_fields = ("make", "model", "nickname", "owner")
    ordering = ("year", "make", "model")
    fields = ("year", "make", "model", "color", "nickname", "owner", "notes")
    readonly_fields = ("owner",)


@admin.register(Fillup)
class FillupAdmin(admin.ModelAdmin):
    list_display = (
        "vehicle",
        "date",
        "odometer",
        "gallons",
        "price_per_gallon",
        "station",
    )
    list_filter = ("vehicle", "date", "station")
    search_fields = ("vehicle", "station")
    ordering = ("vehicle", "date")
    fields = (
        "vehicle",
        "date",
        "odometer",
        "gallons",
        "price_per_gallon",
        "station",
        "location",
        "notes",
    )
    readonly_fields = ("vehicle",)
