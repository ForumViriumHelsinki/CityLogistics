import moment from "moment";
import original_settings from './settings';

export function formatTimestamp(timestamp) {
  return moment(timestamp).format("D.M.YYYY H:mm");
}

export function formatDate(timestamp) {
  return moment(timestamp).format("D.M.YYYY");
}

export function formatTime(timestamp) {
  return moment(timestamp).format("H:mm");
}

export function capitalize(str) {
  return str && (str[0].toUpperCase() + str.slice(1));
}

export const settings = {...original_settings, ...original_settings.siteSpecific[window.location.hostname]};