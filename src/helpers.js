module.exports.isObject = function (object) {
    return object && typeof object === 'object' && !Array.isArray(object);
};

module.exports.isStringOrArray = function (value) {
    return !(typeof value === 'string' || Array.isArray(value));
};

module.exports.ensureArray = function (value) {
    return Array.isArray(value) ? value : [value];
};
