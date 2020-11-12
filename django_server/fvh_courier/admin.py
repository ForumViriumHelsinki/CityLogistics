import datetime

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from fvh_courier import models
from holvi_orders.models import HolviWebshop


class PackageSMSInline(admin.TabularInline):
    model = models.PackageSMS
    extra = 0


@admin.register(models.Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'delivered_time', 'pickup_at', 'deliver_to', 'sender', 'recipient', 'courier']
    list_select_related = ['sender__user', 'courier__user']
    search_fields = [
        'pickup_at__street_address', 'deliver_to__street_address',
        'sender__user__username', 'sender__user__first_name', 'sender__user__last_name',
        'recipient',
        'courier__user__username', 'courier__user__first_name', 'courier__user__last_name',
    ]
    date_hierarchy = 'created_at'
    inlines = [PackageSMSInline]


@admin.register(models.Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['street_address', 'lat', 'lon']
    search_fields = ['street_address']


@admin.register(models.PackageSMS)
class PackageSMSAdmin(admin.ModelAdmin):
    list_display = [
        'created_at', 'package_id', 'message_type', 'recipient_number',
        'package_sender', 'package_recipient', 'courier']
    list_select_related = ['package__sender__user', 'package__courier__user']
    date_hierarchy = 'created_at'

    def package_sender(self, msg):
        return msg.package.sender.get_full_name()

    def courier(self, msg):
        return msg.package.courier.get_full_name()

    def package_recipient(self, msg):
        return msg.package.recipient


admin.site.unregister(User)


class SenderInline(admin.TabularInline):
    model = models.Sender
    raw_id_fields = ['address']
    extra = 0


class CourierInline(admin.TabularInline):
    model = models.Courier
    extra = 0


@admin.register(User)
class UserWithRolesAdmin(UserAdmin):
    inlines = UserAdmin.inlines + [SenderInline, CourierInline]


@admin.register(models.CourierCompany)
class CourierCompanyAdmin(admin.ModelAdmin):
    pass


class IgnoredHolviProductInline(admin.TabularInline):
    model = models.IgnoredHolviProduct
    extra = 0


class RequiredHolviProductInline(admin.TabularInline):
    model = models.RequiredHolviProduct
    extra = 0


@admin.register(HolviWebshop)
class HolviWebshopAdmin(admin.ModelAdmin):
    inlines = [IgnoredHolviProductInline, RequiredHolviProductInline]
