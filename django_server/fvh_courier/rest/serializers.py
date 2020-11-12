from collections import OrderedDict

from django.conf import settings
from django.contrib.auth.forms import PasswordResetForm as BasePasswordResetForm
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import DecimalField
from rest_auth.serializers import PasswordResetSerializer as BasePasswordResetSerializer
from rest_framework import serializers

import fvh_courier.models.base
from fvh_courier import models


class RoundingDecimalField(serializers.DecimalField):
    def validate_precision(self, value):
        return value


serializers.ModelSerializer.serializer_field_mapping[DecimalField] = RoundingDecimalField


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = fvh_courier.models.base.Address
        exclude = ['id', 'created_at', 'modified_at', 'official']


class UserRoleSerializer(serializers.ModelSerializer):
    first_name = serializers.ReadOnlyField(source='user.first_name')
    last_name = serializers.ReadOnlyField(source='user.last_name')
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        fields = ['id', 'user_id', 'first_name', 'last_name', 'username', 'phone_number']


class SenderSerializer(UserRoleSerializer):
    class Meta(UserRoleSerializer.Meta):
        model = models.Sender


class CourierSerializer(UserRoleSerializer):
    class Meta(UserRoleSerializer.Meta):
        model = models.Courier


class CourierCompanySerializer(serializers.ModelSerializer):
    couriers = CourierSerializer(many=True, read_only=True)

    class Meta:
        model = models.CourierCompany
        fields = ['name', 'coordinator_id', 'couriers']


class BaseUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username']


class UserSerializer(serializers.ModelSerializer):
    phone_number = serializers.SerializerMethodField()
    is_courier = serializers.SerializerMethodField()
    is_sender = serializers.SerializerMethodField()

    courier = CourierSerializer(read_only=True)
    courier_company = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username',
                  'phone_number', 'is_courier', 'is_sender', 'courier', 'courier_company']

    def get_phone_number(self, user):
        if self.get_is_courier(user):
            return user.courier.phone_number
        if self.get_is_sender(user):
            return user.sender.phone_number

    def get_is_courier(self, user):
        try:
            return bool(user.courier.id)
        except (ObjectDoesNotExist, AttributeError):
            return False

    def get_is_sender(self, user):
        try:
            return bool(user.sender.id)
        except (ObjectDoesNotExist, AttributeError):
            return False

    def get_courier_company(self, user):
        try:
            company = models.CourierCompany.objects.prefetch_related('couriers__user').get(couriers__user=user)
        except models.CourierCompany.DoesNotExist:
            return None
        return CourierCompanySerializer(company).data


class PackageSerializer(serializers.ModelSerializer):
    pickup_at = AddressSerializer(read_only=False)
    deliver_to = AddressSerializer(read_only=False)

    sender = SenderSerializer(required=False, read_only=True)
    courier = CourierSerializer(required=False, read_only=True)

    def create(self, validated_data):
        """
        Overridden create method to allow creating / referring to addresses; vanilla DRF create does not
        support creation of related objects.
        """
        pickup_at = models.Address.objects.get_or_create(**validated_data.pop('pickup_at'))[0].with_latlng()
        deliver_to = models.Address.objects.get_or_create(**validated_data.pop('deliver_to'))[0].with_latlng()
        return models.Package.objects.create(pickup_at=pickup_at, deliver_to=deliver_to, **validated_data)

    class Meta:
        model = models.Package
        fields = '__all__'
        read_only_fields = ['picked_up_time', 'delivered_time']


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Courier
        fields = ['lat', 'lon']


class OutgoingPackageSerializer(PackageSerializer):
    courier_location = serializers.SerializerMethodField()

    def get_courier_location(self, package):
        # If the location is not relevant to this package, return None:
        if package.delivered_time or not package.courier_id:
            return None

        try:
            courier = package.courier
        except models.Courier.DoesNotExist:
            return None

        # Do not return some old location for the courier that may not be related to this package:
        if courier.modified_at < package.modified_at:
            return None

        return LocationSerializer(courier).data


class PasswordResetForm(BasePasswordResetForm):
    def save(self, **kwargs):
        kwargs = dict(kwargs, domain_override=settings.FRONTEND_HOST, use_https=True,
                      from_email=settings.EMAIL_HOST_USER)
        return super().save(**kwargs)


class PasswordResetSerializer(BasePasswordResetSerializer):
    password_reset_form_class = PasswordResetForm
