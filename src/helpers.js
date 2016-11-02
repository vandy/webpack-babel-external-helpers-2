exports.isObject = function (object) {
    return object && typeof object === 'object' && !Array.isArray(object);
};

exports.isStringOrArray = function (value) {
    return typeof value === 'string' || Array.isArray(value);
};

exports.ensureArray = function (value) {
    return Array.isArray(value) ? value : [value];
};

exports.has = (function () {
    const has = Object.prototype.hasOwnProperty;

    return function (obj, key) {
        return has.call(obj, key);
    };
}());
