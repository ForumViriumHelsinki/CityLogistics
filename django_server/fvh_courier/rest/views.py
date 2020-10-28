import math

from django.utils import timezone
from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action
from rest_framework.generics import RetrieveUpdateDestroyAPIView, get_object_or_404
from rest_framework.response import Response

from drf_jsonschema import to_jsonschema
from fvh_courier import models

from .serializers import PackageSerializer, OutgoingPackageSerializer, LocationSerializer
from .permissions import IsCourier


class PackagesViewSetMixin:
    serializer_class = PackageSerializer

    def get_queryset(self):
        return self.get_base_queryset()\
            .select_related('pickup_at', 'deliver_to', 'sender__user', 'courier__user')


# Insane workaround: DRF schema view generates operationIds from serializer class names, so different endpoints must
# use differently named serializer classes to avoid operationId name clashes:
class AvailablePackageSerializer(PackageSerializer):
    pass


class AvailablePackagesViewSet(PackagesViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = AvailablePackageSerializer
    permission_classes = [IsCourier]

    def get_base_queryset(self):
        return models.Package.available_packages_for_courier(self.request.user.courier)

    @action(detail=True, methods=['put'])
    def reserve(self, request, pk=None):
        """
        Action for courier to reserve an available package for delivery.
        """
        courier_id = request.data.get('courier', None)
        if courier_id:
            courier = models.Courier.objects.filter(id=courier_id, company__coordinator__user=request.user).first()
            if not courier:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            courier = self.request.user.courier

        package = self.get_object()
        package.courier = courier
        package.save()

        models.PackageSMS.notify_sender_of_reservation(package, referer=request.headers.get('referer', None))
        serializer = self.get_serializer(package)
        return Response(serializer.data)


class MyPackagesViewSet(PackagesViewSetMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsCourier]

    def get_base_queryset(self):
        user = self.request.user
        return models.CourierCompany.packages_for_user(user).filter(delivered_time__isnull=True)

    @action(detail=True, methods=['put'])
    def register_pickup(self, request, pk=None):
        """
        Action for courier to register that the package has been picked up for delivery.
        """
        package = self.get_object()
        package.picked_up_time = package.picked_up_time or timezone.now()
        package.save()
        models.PackageSMS.notify_recipient_of_pickup(package, referer=request.headers.get('referer', None))
        serializer = self.get_serializer(package)
        return Response(serializer.data)

    @action(detail=True, methods=['put'])
    def register_delivery(self, request, pk=None):
        """
        Action for courier to register that the package has been delivered to recipient.
        """
        package = self.get_object()
        package.delivered_time = package.delivered_time or timezone.now()
        package.save()
        models.PackageSMS.notify_sender_of_delivery(package, referer=request.headers.get('referer', None))
        serializer = self.get_serializer(package)
        return Response(serializer.data)


# Insane workaround: DRF schema view generates operationIds from serializer class names, so different endpoints must
# use differently named serializer classes to avoid operationId name clashes:
class DeliveredPackageSerializer(PackageSerializer):
    pass


class MyDeliveredPackagesViewSet(PackagesViewSetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = DeliveredPackageSerializer
    permission_classes = [IsCourier]

    def get_base_queryset(self):
        return models.CourierCompany.packages_for_user(self.request.user).filter(delivered_time__isnull=False)


class PendingOutgoingPackagesViewSet(PackagesViewSetMixin, mixins.CreateModelMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OutgoingPackageSerializer

    def get_base_queryset(self):
        return models.Package.sent_by_user(self.request.user).filter(delivered_time=None)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user.sender, courier_company_id=self.request.user.sender.courier_company_id)

    @action(detail=False, methods=['get'])
    def jsonschema(self, request, pk=None):
        return Response(to_jsonschema(self.get_serializer()))


# Insane workaround: DRF schema view generates operationIds from serializer class names, so different endpoints must
# use differently named serializer classes to avoid operationId name clashes:
class DeliveredOutgoingPackageSerializer(OutgoingPackageSerializer):
    pass


class DeliveredOutgoingPackagesViewSet(PackagesViewSetMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DeliveredOutgoingPackageSerializer

    def get_base_queryset(self):
        return models.Package.sent_by_user(self.request.user).filter(delivered_time__isnull=False)


# Insane workaround: DRF schema view generates operationIds from serializer class names, so different endpoints must
# use differently named serializer classes to avoid operationId name clashes:
class PackageByUUIDSerializer(OutgoingPackageSerializer):
    pass


class PackagesByUUIDReadOnlyViewSet(PackagesViewSetMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = PackageByUUIDSerializer
    lookup_field = 'uuid'

    def get_base_queryset(self):
        return models.Package.objects.all()


class MyLocationView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsCourier]
    serializer_class = LocationSerializer

    def get_object(self):
        return get_object_or_404(models.Courier, user=self.request.user)
