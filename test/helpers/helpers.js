module.exports.getUUID = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

module.exports.chooseCustomer = function(customerName) {
  element(by.cssContainingText('a.customer-head span.customer-expl', 'active for context')).click();
  element(by.cssContainingText('ul li:nth-child(2) ul li a', customerName)).click();
};
