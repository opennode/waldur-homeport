import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

// @ngInject
function checkPermission(usersService, $q) {
  return usersService.getCurrentUser().then(user => {
    if (!user.is_staff && !user.is_support) {
      return $q.reject();
    }
  });
}

// @ngInject
export default function issueRoutes($stateProvider) {
  $stateProvider
    .state('support', {
      url: '/support/',
      template: '<issues-workspace></issues-workspace>',
      abstract: true,
      data: {
        auth: true,
        workspace: WOKSPACE_NAMES.support
      }
    })

    .state('support.dashboard', {
      url: '',
      template: '<issues-dashboard></issue-dashboard>',
      data: {
        pageTitle: gettext('Support dashboard'),
        hideBreadcrumbs: true,
        feature: 'support'
      }
    })

    .state('support.helpdesk', {
      url: 'helpdesk/',
      template: '<issues-helpdesk></issues-helpdesk>',
      data: {
        pageTitle: gettext('Helpdesk dashboard'),
        feature: 'support'
      }
    })

    .state('support.detail', {
      url: 'issue/:uuid/',
      template: '<issue-detail></issue-detail>',
      data: {
        pageTitle: gettext('Request detail'),
        feature: 'support'
      }
    })

    .state('support.list', {
      url: 'list/',
      template: '<issues-list-filtered></issues-list-filtered>',
      data: {
        pageTitle: gettext('Support requests'),
        feature: 'support'
      }
    })

    .state('support.resources', {
      url: 'resources/',
      template: '<resource-global-list-filtered/>',
      data: {
        feature: 'support.resources',
        pageTitle: gettext('Resources'),
      },
      resolve: {
        permission: checkPermission
      }
    })

    .state('support.resources-treemap', {
      url: 'resources-treemap/',
      template: '<resources-treemap/>',
      data: {
        feature: 'support.resources-treemap',
        pageTitle: gettext('Resources usage'),
      },
      resolve: {
        permission: checkPermission
      }
    })

    .state('support.organizations', {
      url: 'organizations/',
      template: '<div class="ibox-content"><customer-list/></div>',
      data: {
        feature: 'support.organizations',
        pageTitle: gettext('Financial overview'),
      },
      resolve: {
        permission: checkPermission
      }
    })

    .state('support.flowmap', {
      url: 'flowmap/',
      template: '<flow-map-view></flow-map-view>',
      data: {
        pageTitle: gettext('Flowmap'),
        feature: 'support.flowmap'
      },
      resolve: {
        permission: checkPermission
      }
    })

    .state('support.heatmap', {
      url: 'heatmap/',
      template: '<heat-map></heat-map>',
      data: {
        pageTitle: gettext('Heatmap'),
        feature: 'support.heatmap'
      },
      resolve: {
        permission: checkPermission
      }
    })

    .state('support.sankey-diagram', {
      url: 'sankey-diagram/',
      template: '<sankey-diagram></sankey-diagram>',
      data: {
        pageTitle: gettext('Sankey diagram'),
        feature: 'support.sankey-diagram'
      },
      resolve: {
        permission: checkPermission
      }
    });
}
