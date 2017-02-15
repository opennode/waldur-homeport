import OpenStackSummaryService from './openstack-summary-service';
import openstackTenantModule from './openstack-tenant/module';
import openstackInstanceModule from './openstack-instance/module';
import openstackVolumeModule from './openstack-volume/module';
import openstackBackupModule from './openstack-backup/module';
import openstackBackupScheduleModule from './openstack-backup-schedule/module';
import openstackNetworkModule from './openstack-network/module';
import openstackSubnetModule from './openstack-subnet/module';
import openstackSecurityGroupsModule from './openstack-security-groups/module';
import openstackFloatingIpsModule from './openstack-floating-ips/module';
import openstackSnapshotModule from './openstack-snapshot/module';
import filtersModule from './filters';

export default module => {
  module.service('OpenStackSummaryService', OpenStackSummaryService);
  openstackTenantModule(module);
  openstackInstanceModule(module);
  openstackVolumeModule(module);
  openstackBackupModule(module);
  openstackBackupScheduleModule(module);
  openstackNetworkModule(module);
  openstackSubnetModule(module);
  openstackSecurityGroupsModule(module);
  openstackFloatingIpsModule(module);
  openstackSnapshotModule(module);
  filtersModule(module);
};
