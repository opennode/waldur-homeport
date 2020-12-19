import { FunctionComponent } from 'react';
import { components } from 'react-select';

import { optionRenderer } from './optionRenderer';
import { SelectField } from './SelectField';

const Option = (props) => (
  <components.Option {...props}>{optionRenderer(props.data)}</components.Option>
);

const SingleValue = (props) => (
  <components.SingleValue {...props}>
    {optionRenderer(props.data)}
  </components.SingleValue>
);

export const SelectIconField: FunctionComponent<any> = (props) => (
  <SelectField components={{ Option, SingleValue }} {...props} />
);
