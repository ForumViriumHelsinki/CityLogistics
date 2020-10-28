from django.urls import path
from rest_framework import routers

from .views import (
    AvailablePackagesViewSet, MyPackagesViewSet, MyDeliveredPackagesViewSet,
    PendingOutgoingPackagesViewSet, DeliveredOutgoingPackagesViewSet,
    PackagesByUUIDReadOnlyViewSet, MyLocationView)


router = routers.DefaultRouter()
router.register('available_packages', AvailablePackagesViewSet, 'available_package')
router.register('my_packages', MyPackagesViewSet, 'my_package')
router.register('my_delivered_packages', MyDeliveredPackagesViewSet, 'my_delivered_package')
router.register('pending_outgoing_packages', PendingOutgoingPackagesViewSet, 'pending_outgoing_package')
router.register('delivered_outgoing_packages', DeliveredOutgoingPackagesViewSet, 'delivered_outgoing_package')
router.register('packages', PackagesByUUIDReadOnlyViewSet, 'uuid_package')

urlpatterns = [
    path('my_location/', MyLocationView.as_view(), name='user_location'),
] + router.urls
