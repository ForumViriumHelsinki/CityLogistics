import {packageAction} from "components/types";
import {LocationTuple} from "util_components/types";

export const loginUrl = '/rest-auth/login/';
export const registerUrl = '/rest-auth/registration/';
export const passwordResetUrl = '/rest-auth/password/reset/';
export const changePasswordUrl = '/rest-auth/password/reset/confirm/';

export const availablePackagesUrl = "/rest/available_packages/";
export const reservePackageUrl = (id: number) => `/rest/available_packages/${id}/reserve/`;

export const pendingOutgoingPackagesUrl = "/rest/pending_outgoing_packages/";
export const newPackageSchemaUrl = "/rest/pending_outgoing_packages/jsonschema/";
export const deliveredOutgoingPackagesUrl = "/rest/delivered_outgoing_packages/";
export const myLocationUrl = "/rest/my_location/";

export const myPackagesUrl = "/rest/my_packages/";
export const myDeliveredPackagesUrl = "/rest/my_delivered_packages/";
export const myPackageActionUrl = (id: number, action: packageAction) => `/rest/my_packages/${id}/register_${action}/`;

export const uuidPackageUrl = (uuid: string) => `/rest/packages/${uuid}/`;
