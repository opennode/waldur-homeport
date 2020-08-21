import * as React from 'react';
import AsyncSelect from 'react-select/async';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { providerAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface Props {
  className?: string;
}

export const ProviderAutocomplete: React.FC<Props> = (props) => (
  <div className={`form-group ${props.className}`}>
    <label className="control-label">{translate('Service provider')}</label>
    <Field
      name="provider"
      component={(fieldProps) => (
        <AsyncSelect
          placeholder={translate('Select provider...')}
          loadOptions={providerAutocomplete}
          defaultOptions
          getOptionValue={(option) => option.customer_uuid}
          getOptionLabel={(option) => option.customer_name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No providers')}
          isClearable={true}
        />
      )}
    />
  </div>
);

ProviderAutocomplete.defaultProps = {
  className: 'col-sm-3',
};
