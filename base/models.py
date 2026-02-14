from __future__ import annotations

from django.contrib.postgres.indexes import BrinIndex
from model_utils.fields import AutoCreatedField, AutoLastModifiedField
from model_utils.models import TimeStampedModel


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
