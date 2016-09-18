module.exports = WebpackBabelExtraHelpers;

function WebpackBabelExtraHelpers(options = {}) {
    verifyOptions(options);

    this._options = options;
}

WebpackBabelExtraHelpers.prototype.apply = function (compiler) {
    processOptions.call(this, compiler);
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

    function isObject(object) {
        return object && typeof object === 'object' && !Array.isArray(object);
    }

    function isStringOrArray(value) {
        return !(typeof value === 'string' || Array.isArray(value));
    }
}

function processOptions(compiler) {
    if (this._options.entries) {
        let entry = compiler.options && compiler.options.entry;
        if (entry && typeof entry === 'string') {
            this._options.entries = null;
        }
    }

    let whitelist = this._options.whitelist;
    if (whitelist && typeof whitelist === 'string') {
        let whitelistArray;
        if (whitelist.indexOf(',') > -1) {
            whitelistArray = whitelist.replace(/\s/g, '').split(',');
        } else {
            whitelistArray = whitelist.split(/\s+/);
        }
        this._options.whitelist = whitelistArray.filter(Boolean);
    }
}
