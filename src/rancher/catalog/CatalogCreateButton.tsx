import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const CatalogCreateDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CatalogCreateDialog" */ './CatalogCreateDialog'
    ),
  'CatalogCreateDialog',
);

const createCatalogDialog = (cluster) =>
  openModalDialog(CatalogCreateDialog, { resolve: { cluster } });

export const CatalogCreateButton = (props) => {
  const dispatch = useDispatch();
  const callback = useCallback(
    () => dispatch(createCatalogDialog(props.cluster)),
    [dispatch, props.cluster],
  );
  if (ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Create')}
      action={callback}
      icon="fa fa-plus"
    />
  );
};
