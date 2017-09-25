const {has} = require('./../helpers');

class BaseOptions {
    get(name) {
        return this[name];
    }

    set(name, value) {
        this[name] = value;
    }

    has(name) {
        return has(this, name);
    }
}

class DefaultOptions extends BaseOptions {
    constructor() {
        super();
        this.set('entries', []);
        this.set('aliases', []);
        this.set('whitelist', []);
        this.set('strict', false);
    }
}

module.exports = DefaultOptions;
