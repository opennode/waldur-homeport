import actionDialog from './action-dialog';
import actionFieldBoolean from './action-field-boolean';
import actionFieldChoice from './action-field-choice';
import actionFieldCrontab from './action-field-crontab';
import actionFieldDatetime from './action-field-datetime';
import actionFieldDecimal from './action-field-decimal';
import actionFieldInteger from './action-field-integer';
import actionFieldJson from './action-field-json';
import actionFieldMultiselect from './action-field-multiselect';
import actionFieldSelect from './action-field-select';
import actionFieldString from './action-field-string';
import actionFieldText from './action-field-text';
import actionFieldTimezone from './action-field-timezone';
import actionField from './ActionField';
import appstoreFieldMultiselect from './appstore-field-multiselect';
import appstoreFieldString from './appstore-field-string';
import fieldLabel from './field-label';
import helpicon from './help-icon';
import multiplyBy from './multiply-by';

export default (module) => {
  module.directive('actionDialog', actionDialog);
  module.component('actionField', actionField);
  module.component('actionFieldBoolean', actionFieldBoolean);
  module.component('actionFieldCrontab', actionFieldCrontab);
  module.component('actionFieldDatetime', actionFieldDatetime);
  module.component('actionFieldInteger', actionFieldInteger);
  module.component('actionFieldDecimal', actionFieldDecimal);
  module.component('actionFieldMultiselect', actionFieldMultiselect);
  module.component('actionFieldSelect', actionFieldSelect);
  module.component('actionFieldString', actionFieldString);
  module.component('actionFieldText', actionFieldText);
  module.component('actionFieldChoice', actionFieldChoice);
  module.component('actionFieldTimezone', actionFieldTimezone);
  module.component('actionFieldJson', actionFieldJson);
  module.component('appstoreFieldString', appstoreFieldString);
  module.component('appstoreFieldMultiselect', appstoreFieldMultiselect);
  module.directive('helpicon', helpicon);
  module.directive('multiplyBy', multiplyBy);
  module.directive('fieldLabel', fieldLabel);
};
