const defaultOptions = require('./defaults');
const {isObject, isStringOrArray, ensureArray} = require('./../helpers');

let options = Object.create(null);

init({});

function init(compiler, rawOptions = {}) {
    verify(rawOptions);
    update(compiler.options, rawOptions);
}

exports.init = init;

exports.get = function (name, defaultValue) {
    if (name in options) {
        return options[name];
    }

    return defaultValue;
};

function verify(options) {
    if (!isObject(options)) {
        throw new Error('Options should be an object.');
    }
    if (options.entries && !isStringOrArray(options.entries)) {
        throw new Error('Entries option should be a String or Array');
    }
    if (options.whitelist && !isStringOrArray(options.whitelist)) {
        throw new Error('Whitelist option should be a String or Array');
    }
    if (options.aliases && !Array.isArray(options.aliases)) {
        throw new Error('Aliases option should be an Array');
    }
}

function update(configuration, rawOptions) {
    let overrideDefaults = processOptions(configuration, rawOptions, {
        entries: alignEntries,
        whitelist: parseWhitelist,
        strict: Boolean,
        aliases: aliases => aliases.filter(Boolean),
    });
    options = defaultOptions.get(overrideDefaults);
}

function processOptions(configuration, rawOptions, handlers = {}) {
    let result = Object.create(null);
    Object.keys(rawOptions).forEach(optionName => {
        let optionValue = rawOptions[optionName];
        if (optionName in handlers) {
            let handler = handlers[optionName];
            if (typeof handler === 'function') {
                optionValue = handler(optionValue, configuration);
            } else {
                optionValue = handler;
            }
        }
        result[optionName] = optionValue;
    });

    return result;
}

function alignEntries(optionsEntries, configuration) {
    let resultEntries = [];
    let configurationEntry = configuration.entry;
    if (isObject(configurationEntry)) {
        resultEntries = optionsEntries;
    }

    return ensureArray(resultEntries);
}

function parseWhitelist(whitelist) {
    if (typeof whitelist === 'string') {
        if (whitelist.indexOf(',') > -1) {
            whitelist = whitelist.replace(/\s/g, '').split(',');
        } else {
            whitelist = whitelist.split(/\s+/);
        }
    }

    return whitelist.filter(Boolean);
}
