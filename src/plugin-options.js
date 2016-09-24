const {isObject, isStringOrArray, ensureArray} = require('./helpers');

module.exports = PluginOptions;

function PluginOptions(options) {
    verifyOptions(options);
    this._rawOptions = options;
    this._options = {
        entries: [],
        aliases: [],
    };
}

PluginOptions.prototype.get = function (name, defaultValue) {
    if (name in this._options) {
        return this._options[name];
    }

    return defaultValue;
};

PluginOptions.prototype.process = function (compiler) {
    if (this._rawOptions.entries) {
        this._options.entries = alignEntries(compiler.options, this._rawOptions.entries);
    }

    if (this._rawOptions.whitelist) {
        this._options.whitelist = parseWhitelist(this._rawOptions.whitelist);
    }

    if (this._rawOptions.aliases) {
        this._options.aliases = this._rawOptions.aliases;
    }
};

function verifyOptions(options) {
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

function alignEntries(configuration, optionsEntries) {
    let resultEntries = [];
    let configurationEntry = configuration.entry;
    if (configurationEntry && isObject(configurationEntry)) {
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
