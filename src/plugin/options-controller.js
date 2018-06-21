const DefaultOptions = require('./default-options');
const {isObject, isStringOrArray} = require('./../helpers');
const userOptionHandlers = require('./user-option-handlers');

const pluginOptions = new DefaultOptions();

exports.run = function (compiler, userOptions = {}) {
    verify(userOptions);
    compiler.hooks.environment.tap('webpackBabelExternalHelpersPlugin', function () {
        update(compiler.options, userOptions);
    });
};

exports.get = function (name, defaultValue) {
    return pluginOptions.has(name) ? pluginOptions.get(name) : defaultValue;
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

function update(configuration, userOptions) {
    override(processOptions(configuration, userOptions, {
        entries: userOptionHandlers.alignEntries,
        whitelist: userOptionHandlers.parseWhitelist,
        strict: Boolean,
        aliases: aliases => aliases.filter(Boolean),
    }));
}

function processOptions(configuration, options, handlers = {}) {
    const result = Object.create(null);
    Object.keys(options).forEach(optionName => {
        let optionValue = options[optionName];
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

function override(options) {
    Object.keys(options).forEach(name => {
        if (pluginOptions.has(name)) {
            pluginOptions.set(name, options[name]);
        }
    });
}
