import { FunctionComponent } from 'react';
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { useAsyncRetry } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { InvoiceItem } from '../types';

import { InvoiceEventItem } from './InvoiceEventItem';
import { loadEvents } from './utils';

interface InvoiceEventsDialogProps {
  resolve: {
    item: InvoiceItem;
  };
}

export const InvoiceEventsDialog: FunctionComponent<InvoiceEventsDialogProps> = ({
  resolve,
}) => {
  const { loading, error, value: events, retry } = useAsyncRetry(() =>
    loadEvents(resolve.item),
  );

  return (
    <>
      <ModalHeader>
        <ModalTitle>{translate('Invoice events timeline')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <>
            <p>{translate('Unable to load events for this resource.')}</p>
            <Button bsStyle="primary" onClick={retry}>
              <i className="fa fa-refresh"></i> {translate('Retry')}
            </Button>
          </>
        ) : events.length === 0 ? (
          translate('There are no events for this resource.')
        ) : (
          <div
            id="vertical-timeline"
            className="vertical-container dark-timeline"
          >
            {events.map((event, index) => (
              <InvoiceEventItem event={event} key={index} />
            ))}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <CloseDialogButton />
      </ModalFooter>
    </>
  );
};
