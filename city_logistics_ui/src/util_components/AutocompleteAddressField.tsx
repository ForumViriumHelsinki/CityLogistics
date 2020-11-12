import React from 'react';
// @ts-ignore
import { ReactAutosuggestGeocoder } from "react-autosuggest-geocoder";
import {FieldProps} from "react-jsonschema-form";
import {defaultLocation} from "settings.json";
import './AutocompleteAddressField.scss';

type AutocompleteAddressFieldState = {}

const initialState: AutocompleteAddressFieldState = {};

export default class AutocompleteAddressField extends React.Component<FieldProps, AutocompleteAddressFieldState> {
  state = initialState;

  render() {
    const {schema} = this.props;
    const {} = this.state;
    return <>
      <label>{schema.title}</label>
      <ReactAutosuggestGeocoder
        url="https://api.digitransit.fi/geocoding/v1"
        sources="oa,osm,nlsfi"
        highlightFirstSuggestion
        center={{
          latitude: defaultLocation[0],
          longitude: defaultLocation[1],
        }}
        onSuggestionSelected={this.onSuggestionSelected}
      />
    </>;
  }

  onSuggestionSelected = (event: any, { suggestion }: any): any => {
    const {onChange} = this.props;
    const [lon, lat] = suggestion.geometry.coordinates;
    const {country, housenumber, locality, postalcode, street} = suggestion.properties;
    const [number, unit] = housenumber.split(' ');
    onChange({
      country, lat: lat.toString(), lon: lon.toString(), street, unit,
      housenumber: number, city: locality, postal_code: postalcode,
      street_address: `${street} ${housenumber}`})
  }
}
