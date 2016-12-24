let SingleEntryDependency = require('webpack/lib/dependencies/SingleEntryDependency');

function SingleEntryDependencyWrapper(request) {
    SingleEntryDependency.call(this, request);
}
module.exports = SingleEntryDependencyWrapper;

SingleEntryDependencyWrapper.prototype = Object.create(SingleEntryDependency.prototype);
SingleEntryDependencyWrapper.prototype.constructor = SingleEntryDependencyWrapper;
SingleEntryDependencyWrapper.prototype.type = 'single entry wrapper';
