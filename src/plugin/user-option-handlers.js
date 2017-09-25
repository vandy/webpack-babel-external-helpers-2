const {isObject, ensureArray} = require('./../helpers');

exports.alignEntries = function (entries, configuration) {
    return isObject(configuration.entry) ? ensureArray(entries) : [];
};

exports.parseWhitelist = function (whitelist) {
    if (typeof whitelist === 'string') {
        if (whitelist.indexOf(',') > -1) {
            whitelist = whitelist.replace(/\s/g, '').split(',');
        } else {
            whitelist = whitelist.split(/\s+/);
        }
    }

    return whitelist.filter(Boolean);
};
