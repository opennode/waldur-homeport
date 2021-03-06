import React from 'react';
import { Col, Row } from 'react-bootstrap';

import { CustomerEditDetailsForm } from '@waldur/customer/details/CustomerEditDetailsForm';
import { CustomerLogoUpdateFormData } from '@waldur/customer/details/types';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import { Customer } from '@waldur/workspace/types';

import './CustomerLogoUpdate.scss';

const DEFAULT_LOGO = require('./logo-placeholder.png');

interface CustomerLogoUpdateProps {
  customer: Customer;
  uploadLogo?(): void;
  removeLogo?(): void;
  formData: CustomerLogoUpdateFormData;
  canEdit: boolean;
}

const hasChosenImage = ({ formData }) => formData && formData.image;

const renderRemoveButton = (props) => {
  if (hasChosenImage(props)) {
    return true;
  } else if (props.customer.image) {
    return true;
  }
  return false;
};

const renderLogo = (props) => {
  if (hasChosenImage(props)) {
    return URL.createObjectURL(props.formData.image);
  } else if (props.customer.image) {
    return props.customer.image;
  } else {
    return DEFAULT_LOGO;
  }
};

export const CustomerLogoUpdate: React.FC<CustomerLogoUpdateProps> = (
  props,
) => {
  const { canEdit } = props;
  return (
    <div className="customer-edit-details">
      <Row>
        <Col md={3}>
          <div className="organization-logo">
            <div className="organization-img-wrapper">
              <img src={renderLogo(props)} alt="Organization logo here" />
            </div>
          </div>
        </Col>
        {canEdit && (
          <Col md={9}>
            <div className="organization-logo-actions">
              {renderRemoveButton(props) && (
                <ActionButton
                  className="btn btn-sm btn-danger m-b-sm"
                  title={translate('Remove logo')}
                  action={props.removeLogo}
                  icon="fa fa-trash"
                />
              )}
              <CustomerEditDetailsForm
                hasChosenImage={hasChosenImage(props)}
                onSubmit={props.uploadLogo}
              />
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};
