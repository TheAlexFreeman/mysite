from __future__ import annotations

from functools import cached_property
from django.db import models

from base.models import BaseModel


# Create your models here.
class Vehicle(BaseModel):
    id = models.BigAutoField("ID", primary_key=True)
    make = models.CharField("Make", max_length=63)
    model = models.CharField("Model", max_length=63)
    year = models.IntegerField("Year")
    color = models.CharField("Color", max_length=63)
    nickname = models.CharField("Nickname", max_length=63)
    owner = models.CharField("Owner", max_length=63)
    notes = models.TextField("Notes", blank=True)

    def __str__(self):
        if nickname := self.nickname:
            return nickname
        return f"{self.year} {self.make} {self.model}"

    class Meta:
        verbose_name = "Vehicle"
        verbose_name_plural = "Vehicles"

    @cached_property
    def first_fillup(self) -> "Fillup" | None:
        return self.fillups.order_by("date").first()

    @property
    def total_miles(self) -> int | None:
        if first_fillup := self.first_fillup:
            return self.fillups.last().odometer - first_fillup.odometer
        return None

    @property
    def total_mpg(self) -> float | None:
        if total_miles := self.total_miles:
            total_gallons = self.fillups.aggregate(total_gallons=models.Sum("gallons"))[
                "total_gallons"
            ]
            return total_miles / total_gallons
        return None


class Fillup(BaseModel):
    id = models.BigAutoField("ID", primary_key=True)
    vehicle = models.ForeignKey(
        Vehicle,
        verbose_name="Vehicle",
        related_name="fillups",
        related_query_name="fillup",
        on_delete=models.CASCADE,
    )
    date = models.DateField("Date")
    odometer = models.IntegerField("Odometer")
    gallons = models.DecimalField("Gallons", max_digits=5, decimal_places=3)
    price_per_gallon = models.DecimalField(
        "Price per Gallon", max_digits=5, decimal_places=3
    )
    station = models.CharField("Station", max_length=63)
    location = models.CharField("Location", max_length=255)
    notes = models.TextField("Notes", blank=True)

    def __str__(self):
        return f"{self.vehicle} @ {self.odometer} on {self.date}"

    class Meta:
        verbose_name = "Fill-up"
        verbose_name_plural = "Fill-ups"

    @cached_property
    def total_cost(self) -> float:
        return self.gallons * self.price_per_gallon

    @cached_property
    def previous_fillup(self) -> "Fillup" | None:
        return self.vehicle.fillups.filter(date__lt=self.date).order_by("-date").first()

    @cached_property
    def miles_driven(self) -> int | None:
        if previous_fillup := self.previous_fillup:
            return self.odometer - previous_fillup.odometer
        return None

    @cached_property
    def mpg(self) -> float | None:
        if miles := self.miles_driven:
            return miles / self.gallons
        return None
