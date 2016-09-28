'use strict';

(function() {
  angular.module('ncsaas').service('DashboardChartService', DashboardChartService);

  function DashboardChartService($q) {
    this.getQuotaHistory = function(quota) {
      return $q.when(randomRange());
    };
    function randomRange() {
      var n = 10;
      var xs = [];
      var date = moment().subtract(n, 'days');
      for (var i = 0; i < n; i++) {
        xs.push({
          value: Math.round(Math.random() * 100),
          date: date.format("YYYY-MM-DD")
        });
        date = date.add(1, 'day');
      }
      return xs;
    }
  }
})();


(function() {
  angular.module('ncsaas')
    .controller('OrganizationDashboardController', OrganizationDashboardController);

  function OrganizationDashboardController(
    currentStateService, DashboardChartService, $q
  ) {
    var vm = this;
    activate();

    vm.charts = [
      {
        quota: 'nc_app_count',
        title: 'Applications'
      },
      {
        quota: 'nc_vm_count',
        title: 'Virtual machines'
      },
      {
        quota: 'nc_private_cloud_count',
        title: 'Private clouds'
      }
    ];
    function activate() {
      var promise = currentStateService.getCustomer().then(function(customer) {
        var promises = vm.charts.map(function(chart) {
          var matches = customer.quotas.filter(function(quota) {
            return quota.name === chart.quota;
          });
          if (matches) {
            var url = matches[0].url;
            return DashboardChartService.getQuotaHistory(url).then(function(data) {
              chart.data = data;
              chart.current = data[data.length - 1].value;
            });
          }
        });
        return $q.all(promises);
      });
      vm.loading = true;
      promise.finally(function() {
        vm.loading = false;
      });
    }
  }
})();


(function() {
  angular.module('ncsaas')
    .controller('DashboardIndexController', [
      '$scope',
      '$stateParams',
      'baseControllerClass',
      'customersService',
      DashboardIndexController]);

  function DashboardIndexController(
    $scope, $stateParams, baseControllerClass, customersService) {
    var controllerScope = this;
    var EventController = baseControllerClass.extend({
      userCanManageProjects: false,
      init: function() {
        $scope.activeTab = $stateParams.tab || 'activity';
        this.checkQuotas = 'project';
        this.checkPermissions();
      },
      checkPermissions: function() {
        customersService.isOwnerOrStaff().then(function() {
          this.userCanManageProjects = true;
        }.bind(this));
      }
    });

    controllerScope.__proto__ = new EventController();
  }

  angular.module('ncsaas')
    .controller('DashboardCostController', [
      'baseControllerClass',
      'priceEstimationService',
      'ENV',
      'customersService',
      'resourcesService',
      DashboardCostController]);

  function DashboardCostController(
    baseControllerClass,
    priceEstimationService,
    ENV,
    customersService,
    resourcesService) {
    var controllerScope = this;
    var EventController = baseControllerClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.activate();
        controllerScope.loading = true;

        this.checkQuotasResource = 'resource';
        this.checkQuotasProvider = 'service';

        var vm = this;
        customersService.isOwnerOrStaff().then(function(hasRole) {
          vm.showProviderButton = hasRole;
        });
      },

      activate: function() {
        var vm = this;
        priceEstimationService.cacheTime = 1000 * 60 * 10;
        priceEstimationService.pageSize = 1000;
        priceEstimationService.getList().then(function(rows) {
          vm.processChartData(rows);
          vm.processTableData(rows);
        });
      },

      selectRow: function(row) {
        row.selected = !row.selected;
        row.activeTab = (ENV.featuresVisible || ENV.toBeFeatures.indexOf('providers') == -1)
          ? 'services'
          : 'projects';
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('resources') == -1) {
          this.getResourceDetails(row);
        }
      },

      getResourceDetails: function(row) {
        for (var i = 0; i < row.resources.length; i++) {
          var resource = row.resources[i];
          if (resource.scope && (!resource.resource_type || !resource.project_uuid)) {
            resourcesService.$get(null, null, resource.scope).then(function(response) {
              resource.resource_uuid = response.uuid;
              resource.resource_type = response.resource_type;
              resource.project_uuid = response.project_uuid;
              resource.project_name = response.project_name;
            });
          }
        }
      },

      processChartData: function(rows) {
        var result = {};
        rows.forEach(function(row) {
          if (['customer', 'service', 'project', 'resource'].indexOf(row.scope_type) >= 0) {
            var date = moment(row.month + ' ' + row.year, 'MM YYYY');
            var key = date.format("YYYYMM");

            if (!result[key]) {

              result[key] = {
                customer: [],
                service: [],
                project: [],
                resource: []
              };
            }

            result[key][row.scope_type].push({
              name: row.scope_name,
              value: row.total
            });

          }
        });
        controllerScope.loading = false;

        this.costData = result;
      },

      processTableData: function(rows) {
        var results = {},
            scopeArray,
            currentDate = new Date();;
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          var date = moment(row.month, 'MM').format('MMMM') + ' ' + row.year;
          if (!results.hasOwnProperty(date)) {
            results[date] = {
              total: 0,
              isCurrent: (currentDate.getFullYear() === row.year && row.month == currentDate.getMonth() + 1),
              projects: [],
              services: [],
              resources: []
            }
          }
          if (row.scope_type === 'customer') {
            results[date].total = row.total;
          }
          if (row.scope_type === 'project') {
            scopeArray = row.scope_name.split(' | ');
            row.project_name = scopeArray[0];
            row.organization_name = scopeArray[1];
            results[date].projects.push(row);
          }
          if (row.scope_type === 'resource') {
            results[date].resources.push(row);
          }
          if (row.scope_type === 'service') {
            results[date].services.push(row);
          }
        }
        var table = [];
        for (var date in results) {
          var row = results[date];
          table.push({
            date: date,
            total: row.total,
            projects: row.projects,
            services: row.services,
            resources: row.resources,
            isCurrent: row.isCurrent
          });
        }
        if (table.length > 0) {
          this.selectRow(table[0]);
        }
        this.table = table;
      }
    });

    controllerScope.__proto__ = new EventController();
  }

  angular.module('ncsaas')
    .controller('DashboardActivityController', [
      'baseControllerClass',
      '$scope',
      '$rootScope',
      '$state',
      'projectsService',
      'alertsService',
      'eventsService',
      'eventStatisticsService',
      'resourcesCountService',
      'currentStateService',
      'eventFormatter',
      'alertFormatter',
      'ENV',
      '$window',
      '$q',
      'ncUtils',
      'EventDialogsService',
      DashboardActivityController]);

  function DashboardActivityController(
    baseControllerClass,
    $scope,
    $rootScope,
    $state,
    projectsService,
    alertsService,
    eventsService,
    eventStatisticsService,
    resourcesCountService,
    currentStateService,
    eventFormatter,
    alertFormatter,
    ENV,
    $window,
    $q,
    ncUtils,
    EventDialogsService) {
    var controllerScope = this;
    var EventController = baseControllerClass.extend({
      showGraph: true,
      currentCustomer: null,
      init:function() {
        this.controllerScope = controllerScope;
        this.cacheTime = ENV.dashboardEventsCacheTime;
        this._super();
        this.activeTab = 'activity';
        this.alertsHelpKey = ENV.dashboardHelp.alertsList.name;
        this.eventsHelpKey = ENV.dashboardHelp.eventsList.name;
        this.chartOptions = {
          responsive: true,
          scaleShowVerticalLines: false,
          scaleShowGridLines: false,
          bezierCurve: false
        };

        this.checkQuotas = 'project';

        $scope.$on('currentCustomerUpdated', function() {
          controllerScope.activate();
        });

        this.activate();
        this.resizeControl();
      },
      resizeControl: function() {
        var vm = this;

        var window = angular.element($window);
        window.bind('resize', function() {
          vm.showGraph = false;
          setTimeout(function() {
            vm.showGraph = true;
            $scope.$apply();
          }, 0);
          $scope.$apply();
        });
      },
      showHelpTypes: EventDialogsService.alertTypes,
      selectProject: function(project) {
        var projectCounters, projectEvents;
        if (project) {
          project.selected =! project.selected;
          if (!project.count) {
            projectCounters = this.getProjectCounters(project);
          }
          if ((ENV.featuresVisible || ENV.toBeFeatures.indexOf('eventlog') == -1) && !project.chartData) {
            projectEvents = this.getProjectEvents(project);
          }

          ncUtils.blockElement('activity-content-' + project.uuid, $q.all([projectCounters, projectEvents]));
        }
      },
      activate: function() {
        this.customer_uuid = currentStateService.getCustomerUuid();
        this.getCustomerProjects();
        this.getCustomerAlerts();
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('eventlog') == -1) {
          this.getCustomerEvents();
        }
      },
      getCustomerAlerts: function() {
        var vm = this;
        var promise = currentStateService.getCustomer().then(function(customer) {
          return alertsService.getList({
            aggregate: 'customer',
            uuid: customer.uuid
          }).then(function(response) {
            vm.alerts = response.map(function(alert) {
              alert.html_message = alertFormatter.format(alert);
              alert.icon = alertFormatter.getIcon(alert);
              return alert;
            });
          });
        });
        ncUtils.blockElement('dashboard-alerts-list', promise);
      },
      getCustomerEvents: function() {
        var vm = this;
        var promise = currentStateService.getCustomer().then(function(customer) {
          vm.currentCustomer = customer;
          return eventsService.getList({scope: customer.url}).then(function(response) {
            vm.events = response.map(function(event) {
              event.html_message = eventFormatter.format(event);
              event.icon = eventFormatter.getIcon(event);
              return event;
            });
          });
        });
        ncUtils.blockElement('dashboard-events-list', promise);
      },
      getCustomerProjects: function() {
        var vm = this,
          promise = projectsService.getList().then(function(projects) {
            vm.projects = projects;
            vm.selectProject(vm.projects[0]);
          });
        ncUtils.blockElement('dashboard-projects-list', promise)
      },
      getProjectCounters: function (project) {
        var query = angular.extend(
            {UUID: project.uuid},
            eventsService.defaultFilter
          );
        return projectsService.getCounters(query).then(function(counters) {
          project.count = counters;
          var usage = ncUtils.getQuotaUsage(project.quotas);
          project.count.services = usage.nc_service_project_link_count;
          project.count.resources = usage.nc_resource_count;
        });
      },
      getProjectEvents: function (project) {
        var end = moment.utc().unix();
        var count = 7;
        var start = moment.utc().subtract(count + 1, 'days').unix();

        return eventStatisticsService.getList({
          scope: project.url,
          start: start,
          end: end,
          points_count: count + 1
        }).then(function(response) {
          var labels = [];
          var total = [];
          for (var i = 0; i < response.length; i++) {
            var date = moment.unix(response[i].point);
            var day = date.format('dddd');
            var value = response[i].object.count;
            labels.push(day);
            total.push(value);
          }

          var points = [];
          for (var i = 1; i < total.length; i++) {
            points[i] = total[i] - total[i-1];
          }
          labels.shift();
          points.shift();

          project.d3Data = {
            x: labels,
            y: points
          };
        });
      },
      addSupportContract: function(project) {
        $rootScope.$broadcast('adjustCurrentProject', project);
        $state.go('appstore.store', {category: 'support'});
      }
    });

    controllerScope.__proto__ = new EventController();
  }
})();

(function() {

  angular.module('ncsaas')
      .controller('DashboardResourcesController', [
        'baseControllerClass',
        'projectsService',
        'currentStateService',
        'priceEstimationService',
        'ncUtils',
        'ENV',
        '$q',
        '$filter',
        DashboardResourcesController]);

  function DashboardResourcesController(
      baseControllerClass,
      projectsService,
      currentStateService,
      priceEstimationService,
      ncUtils,
      ENV,
      $q,
      $filter) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      showGraph: true,
      currentCustomer: null,
      init:function() {
        this.controllerScope = controllerScope;
        this.cacheTime = ENV.dashboardEventsCacheTime;
        this._super();
        this.activeTab = 'resources';
        this.barChartTab ='vmsByProject';
        this.activate();
        this.currentMonth = new Date().getMonth() + 1;
        this.currentYear = new Date().getFullYear();
      },
      activate: function() {
        var vm = this;
        var projectPromise = projectsService.getList().then(function(projects) {
          vm.projectsList = projects;
          return projects;
        });
        var quotasPromise = projectPromise.then(function(projects) {
          return vm.getProjectsQuotas(projects).then(function(quotas) {
            vm.formatProjectQuotas(quotas);
          });
        });
        var barChartPromise = quotasPromise.then(function() {
          vm.projectsList.showBarChart = true;
          vm.setResourcesByProjectChartData();
        });
        var monthChartPromise = quotasPromise.then(function() {
          vm.setMonthCostChartData();
        });
        ncUtils.blockElement('bar-chart', barChartPromise);
        ncUtils.blockElement('month-cost-charts', monthChartPromise);
        ncUtils.blockElement('pie-charts', this.setCurrentUsageChartData());
      },
      getProjectsQuotas: function(projects) {
        // TODO: replace with data from relevant endpoint when ready
        var factory = projectsService.getFactory(false, '/stats/quota/');
        var promises = projects.map(function(project) {
          var query = {
            aggregate: 'project',
            uuid: project.uuid,
            quota_name: ['vcpu', 'ram', 'storage']
          };
          return factory.get(query).$promise.then(function(quotas) {
            quotas.project = project;
            return quotas;
          });
        });
        return $q.all(promises);
      },
      formatProjectQuotas: function(quotas) {
        quotas.forEach(function(quota) {
          var project = quota.project;
          project.vcpu = quota.vcpu_usage;
          project.ram = $filter('filesize')(quota.ram_usage);
          project.storage = $filter('filesize')(quota.storage_usage);
        });
      },
      setCurrentUsageChartData: function() {
        var vm = this;
        return currentStateService.getCustomer().then(function(response) {
          vm.currentCustomer = response;
          vm.currentPlan = response.plan.name;
          vm.resourcesLimit = null;
          vm.resourcesUsage = null;

          vm.currentUsageData = {
            chartType: 'vms',
            chartWidth: 500,
            legendDescription: null,
            legendLink: 'plans',
            data: []
          };
          var freeResources = null;
          response.quotas.forEach(function(item) {
            if (item.name === 'nc_resource_count') {
              var limit;
              if (item.limit != -1) {
                var free = item.limit - item.usage;
                limit = item.limit;
                freeResources = {
                  label: free + ' free',
                  count: free,
                  name: 'plans'
                };
                vm.currentUsageData.legendDescription = item.usage + " used / " + limit + " total";
              } else {
                vm.currentUsageData.legendDescription = item.usage + " used";
                limit = 'unlimited';
              }
              vm.resourcesLimit = limit;
              vm.resourcesUsage = item.usage;
            }
            if (item.name === 'nc_vm_count') {
              var vms = item.usage;
              vm.currentUsageData.data.push({ label: vms + ' VMs', count: vms, name: 'vms' });
            }
            if (item.name === 'nc_app_count') {
              var apps = item.usage;
              vm.currentUsageData.data.push({ label: apps + ' applications', count: apps, name: 'apps' })
            }
            if (item.name === 'nc_private_cloud_count') {
              var pcs = item.usage;
              vm.currentUsageData.data.push({ label: pcs + ' private clouds', count: pcs, name: 'private clouds' })
            }
          });
          vm.currentUsageData.data = ncUtils.sortArrayOfObjects(vm.currentUsageData.data, 'name', 0);
          freeResources && vm.currentUsageData.data.push(freeResources);
        });
      },
      setMonthCostChartData: function() {
        var vm = this;
        priceEstimationService.pageSize = 100;
        return priceEstimationService.getAll().then(function(rows) {
          vm.priceEstimationRows = rows;
          vm.monthCostChartData = {
            chartType: 'services',
            chartWidth: 200,
            legendDescription: null,
            legendLink: 'providers',
            data: []
          };
          vm.totalMonthCost = 0;
          rows.forEach(function(item) {
            if (item.scope_type === 'service'
                && (vm.currentYear === item.year && vm.currentMonth === item.month)
                && vm.monthCostChartData.data.length < 5
                && item.total > 0) {
              var truncatedName = ncUtils.truncateTo(item.scope_name, 8);
              var inData = false;
              for (var i = 0; i < vm.monthCostChartData.data.length; i++) {
                if (vm.monthCostChartData.data[i].itemName === item.scope_name) {
                  inData = true;
                }
              }
              !inData && vm.monthCostChartData.data.push({
                label: truncatedName + ' ('+ ENV.currency + item.total.toFixed(2) +')',
                fullLabel: item.scope_name + ' ('+ ENV.currency + item.total.toFixed(2) +')',
                count: item.total,
                itemName: item.scope_name,
                name: 'providers' });
              !inData && (vm.totalMonthCost += item.total);
            }
            vm.monthCostChartData.legendDescription = "Projected cost: " + ENV.currency + vm.totalMonthCost.toFixed(2);
          });
          vm.monthCostChartData.data = ncUtils.sortArrayOfObjects(vm.monthCostChartData.data, 'count', 1);
          vm.setServicesByProjectChartData();
        });
      },
      setServicesByProjectChartData: function() {
        var vm = this;
        vm.servicesByProjectChartData = {
          data :[],
          projects: vm.projectsList,
          chartType: 'services'
        };
        vm.priceEstimationRows.forEach(function(priceRow) {
          if (priceRow.scope_type === 'service'
              && (vm.currentYear === priceRow.year && vm.currentMonth === priceRow.month)
              && vm.servicesByProjectChartData.data.length < 5) {
            var inData = false;
            for (var i = 0; i < vm.servicesByProjectChartData.data.length; i++) {
              if (vm.servicesByProjectChartData.data[i].name === priceRow.scope_name) {
                inData = true;
              }
            }
            !inData && priceRow.total > 0 && vm.servicesByProjectChartData.data.push({data: [], name: priceRow.scope_name, total: priceRow.total});
            vm.projectsList.forEach(function(project) {
              var projectPrice = 0;
              vm.priceEstimationRows.forEach(function(innerPriceRow) {
                if (innerPriceRow.scope_type === 'serviceprojectlink'
                    && (vm.currentYear === innerPriceRow.year && vm.currentMonth === innerPriceRow.month)
                    && innerPriceRow.scope_name.indexOf(priceRow.scope_name) !== -1
                    && innerPriceRow.scope_name.indexOf(project.name) !== -1) {
                  projectPrice += innerPriceRow.total;
                }
              });
              var lastElem = vm.servicesByProjectChartData.data.length -1;
              (lastElem > -1)
                && vm.servicesByProjectChartData.data[lastElem].data.push({project: project.uuid, count: parseFloat(projectPrice.toFixed(2))});
            });
          }
        });
        vm.servicesByProjectChartData.data = ncUtils.sortArrayOfObjects(vm.servicesByProjectChartData.data, 'total', 1);
      },
      setResourcesByProjectChartData: function() {
        var vm = this;
        vm.resourcesByProjectChartData = {
          data :[{data: [], name: 'Applications'}, {data: [], name: 'Private clouds'}, {data: [], name: 'VMs'}],
          projects: vm.projectsList,
          chartType: 'resources'
        };
        vm.resourcesCount = 0;
        vm.projectsList.forEach(function(item) {
          item.quotas.forEach(function(itemQuota) {
            if (itemQuota.name === 'nc_vm_count') {
              vm.resourcesByProjectChartData.data[2].data.push({project: item.uuid, count: itemQuota.usage});
              vm.resourcesCount += itemQuota.usage;
            }
            if (itemQuota.name === 'nc_app_count') {
              vm.resourcesByProjectChartData.data[0].data.push({project: item.uuid, count: itemQuota.usage});
              vm.resourcesCount += itemQuota.usage;
            }
            if (itemQuota.name === 'nc_private_cloud_count') {
              vm.resourcesByProjectChartData.data[1].data.push({project: item.uuid, count: itemQuota.usage});
              vm.resourcesCount += itemQuota.usage;            }

          });
        });
      },
      changeTab: function(tabName) {
        this.barChartTab = this.totalMonthCost ? tabName : this.barChartTab;
        return false
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
