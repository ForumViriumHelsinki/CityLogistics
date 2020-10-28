from datetime import timedelta

from django.core.exceptions import ObjectDoesNotExist
from django.utils.timezone import now
from rest_framework import permissions


class IsCourier(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        try:
            return bool(request.user.courier.id)
        except (ObjectDoesNotExist, AttributeError):
            return False
