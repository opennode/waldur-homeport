import { useRouter } from '@uirouter/react';
import { useMemo, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';
import { change } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import {
  CUSTOMER_OWNER_ROLE,
  PROJECT_ADMIN_ROLE,
  PROJECT_MANAGER_ROLE,
  PROJECT_MEMBER_ROLE,
  PROJECT_ROLES,
} from '@waldur/core/constants';
import { isFeatureVisible } from '@waldur/features/connect';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';

import { InvitationService } from '../InvitationService';

import { fetchUserDetails } from './api';
import { InvitationPolicyService } from './InvitationPolicyService';
import {
  civilNumberSelector,
  taxNumberSelector,
  roleSelector,
} from './selectors';

const getRoles = (context) => {
  const roles = [
    {
      title: ENV.roles.owner,
      value: CUSTOMER_OWNER_ROLE,
      icon: 'fa-sitemap',
    },
    {
      title: ENV.roles.manager,
      value: PROJECT_MANAGER_ROLE,
      icon: 'fa-users',
    },
    {
      title: ENV.roles.admin,
      value: PROJECT_ADMIN_ROLE,
      icon: 'fa-server',
    },
  ];
  if (isFeatureVisible('project.support')) {
    roles.push({
      title: ENV.roles.member,
      value: PROJECT_MEMBER_ROLE,
      icon: 'fa-user-o',
    });
  }
  return roles.filter((role) =>
    InvitationPolicyService.canManageRole(context, role),
  );
};

export const useInvitationCreateDialog = (context) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const civilNumber = useSelector(civilNumberSelector);
  const taxNumber = useSelector(taxNumberSelector);
  const role = useSelector(roleSelector);
  const [
    { loading: fetchingUserDetails, value: userDetails },
    fetchUserDetailsCallback,
  ] = useAsyncFn(() => fetchUserDetails(civilNumber, taxNumber), [
    civilNumber,
    taxNumber,
  ]);

  const roles = useMemo(() => getRoles(context), [context]);
  useEffect(() => {
    dispatch(change('InvitationCreateDialog', 'role', roles[0].value));
  }, [dispatch, roles]);

  const roleDisabled = ENV.invitationRequireUserDetails && !userDetails;
  const projectEnabled = PROJECT_ROLES.includes(role) && !roleDisabled;

  const createInvitation = useCallback(
    async (formData) => {
      try {
        const payload: Record<string, any> = {};
        payload.email = formData.email;
        payload.civil_number = formData.civil_number;
        payload.tax_number = formData.tax_number;
        if (PROJECT_ROLES.includes(role)) {
          payload.project_role = role;
          payload.project = formData.project.url;
        } else {
          payload.customer_role = role;
          payload.customer = context.customer.url;
        }
        if (userDetails) {
          Object.assign(payload, userDetails);
        }
        await InvitationService.createInvitation(payload);
        dispatch(closeModalDialog());
        router.stateService.go('organization.team');
        dispatch(showSuccess('Invitation has been created.'));
      } catch (e) {
        dispatch(showError('Unable to create invitation.'));
      }
    },
    [dispatch, router.stateService, context.customer, userDetails, role],
  );

  return {
    fetchUserDetailsCallback,
    fetchingUserDetails,
    userDetails,
    createInvitation,
    roleDisabled,
    roles,
    projectEnabled,
  };
};
