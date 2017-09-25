const SingleEntryDependency = require('webpack/lib/dependencies/SingleEntryDependency');

class SingleEntryDependencyWrapper extends SingleEntryDependency {
    constructor(request) {
        super(request);
    }

    get type() {
        return 'single entry wrapper';
    }
}

module.exports = SingleEntryDependencyWrapper;
