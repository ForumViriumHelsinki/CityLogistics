import React from 'react';

import Form from "react-jsonschema-form";
import sessionRequest from "sessionRequest";
import CenteredSpinner from "util_components/bootstrap/CenteredSpinner";

import ErrorAlert from "util_components/bootstrap/ErrorAlert";
import moment from "moment";
import Component from "util_components/Component";
import {newPackageSchemaUrl, pendingOutgoingPackagesUrl} from "urls";
import AutocompleteAddressField from "util_components/AutocompleteAddressField";

import { JSONSchema6 } from 'json-schema';

type func = () => any;

export default class NewPackage extends Component<{onCreated: func}> {
  uiSchema = {
    pickup_at: {'ui:field': AutocompleteAddressField},
    deliver_to: {'ui:field': AutocompleteAddressField}
  };

  timeFieldDefaults = {
    earliest_pickup_time: 0,
    latest_pickup_time: 4,
    earliest_delivery_time: 0,
    latest_delivery_time: 6,
  };

  state: {schema?: JSONSchema6, error: boolean} = {
    schema: undefined,
    error: false
  };

  static bindMethods = ['onSubmit'];

  componentDidMount() {
    sessionRequest(newPackageSchemaUrl)
    .then((response) => response.json())
    .then((schema) => this.setSchema(schema))
  }

  render() {
    const {schema, error} = this.state;
    if (schema) {
      return <>
        <ErrorAlert status={error} message="Creation failed. Try again maybe?"/>
        <Form schema={schema} uiSchema={this.uiSchema} onSubmit={this.onSubmit}/>
      </>
    } else return <CenteredSpinner/>
  }

  setSchema(schema: any) {
    Object.entries(this.timeFieldDefaults).forEach(([field, hours]) =>
      schema.properties[field].default = moment().startOf('hour').add(hours + 1, 'hours').format()
    );
    this.setState({schema});
  }

  // @ts-ignore
  onSubmit({formData}) {
    sessionRequest(pendingOutgoingPackagesUrl, {method: 'POST', data: formData})
    .then((response) => {
      if (response.status == 201) this.props.onCreated();
      else this.setState({error: true});
    })
  }
}
