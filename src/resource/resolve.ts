import { Transition } from '@uirouter/react';

import { getCustomer, getProject } from '@waldur/project/api';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import {
  setCurrentCustomer,
  setCurrentProject,
  setCurrentWorkspace,
} from '@waldur/workspace/actions';
import { PROJECT_WORKSPACE } from '@waldur/workspace/types';

import { ResourcesService } from './ResourcesService';

export function loadResource(trans: Transition) {
  if (!trans.params().uuid) {
    return Promise.reject();
  }

  return ResourcesService.get(trans.params().resource_type, trans.params().uuid)
    .then((resource) => {
      return getProject(resource.project_uuid).then((project) => {
        return { project };
      });
    })
    .then(({ project }) => {
      return getCustomer(project.customer_uuid).then((customer) => {
        store.dispatch(setCurrentCustomer(customer));
        store.dispatch(setCurrentProject(project));
        store.dispatch(setCurrentWorkspace(PROJECT_WORKSPACE));
        return { customer, project };
      });
    })
    .catch((response) => {
      if (response.status === 404) {
        router.stateService.go('errorPage.notFound');
      }
    });
}
