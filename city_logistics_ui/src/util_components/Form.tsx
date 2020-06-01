import React from 'react';

type FormProps = {
  schemaUrl: string,
  onSave?: () => any,
  onCancel?: () => any
}

type FormState = {
  loading: boolean
}

const initialState: FormState = {
  loading: false
};

export default class Form extends React.Component<FormProps, FormState> {
  state = initialState;

  render() {
    const {} = this.props;
    const {} = this.state;
    return <div>Form TBD</div>;
  }
}
