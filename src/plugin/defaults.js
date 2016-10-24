const {has} = require('./../helpers');

exports.get = function (override = {}) {
    let options = new DefaultOptions();
    if (Object.keys(override).length) {
        overrideDefaults(options, override);
    }

    return options;
};

function overrideDefaults(defaults, override) {
    Object.keys(override).forEach(optionName => {
        if (has(defaults, optionName)) {
            defaults[optionName] = override[optionName];
        }
    });
}

function DefaultOptions() {
    const defaults = Object.create(null);
    defaults.entries = [];
    defaults.aliases = [];
    defaults.whitelist = [];
    defaults.strict = false;

    return defaults;
}
