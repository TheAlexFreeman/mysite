from __future__ import annotations
from datetime import datetime
from typing import TypeVar

from django.contrib.postgres.indexes import BrinIndex
from django.db import models
from model_utils.fields import AutoCreatedField, AutoLastModifiedField
from model_utils.models import TimeStampedModel



BaseModelGenericType = TypeVar("BaseModelGenericType", bound="BaseModel")


class BaseModelQuerySet(models.QuerySet[BaseModelGenericType]):
    def created_after(self, start: datetime) -> BaseModelQuerySet:
        return self.filter(created__gt=start)

    def created_before(self, end: datetime) -> BaseModelQuerySet:
        return self.filter(created__lt=end)

    def created_between(self, start: datetime, end: datetime) -> BaseModelQuerySet:
        return self.filter(created__gte=start, created__lte=end)


class BaseModel(TimeStampedModel):
    """
    Abstract base model that includes common fields for all models.
    """

    created = AutoCreatedField("Created")
    modified = AutoLastModifiedField("Modified")

    class Meta:
        abstract = True
        indexes = [BrinIndex(fields=["created"])]
        verbose_name = "Base Model"
        verbose_name_plural = "Base Models"

    def __repr__(self):
        return f"{self.__class__.__name__}:{self.pk}"

    def __str__(self):
        return repr(self)

    def save_fields(self, **kwargs):
        field_names = kwargs.keys()
        for field_name in field_names:
            setattr(self, field_name, kwargs[field_name])
        self.save(update_fields=field_names)
