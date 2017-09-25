const {isObject, ensureArray} = require('../../helpers');

module.exports = function modifyEntry(configuration, pluginOptions) {
    ensureEntryPointIsArray(configuration, 'entry', pluginOptions.entries);
};

function ensureEntryPointIsArray(container, entryName, onlyEntries) {
    const entry = container[entryName];
    if (typeof entry === 'string') {
        if (!onlyEntries.length || onlyEntries.indexOf(entryName) > -1) {
            replaceEntryString(container, entryName);
        }
    } else if (isObject(entry)) {
        Object.keys(entry).forEach(entryName => ensureEntryPointIsArray(entry, entryName, onlyEntries));
    }
}

function replaceEntryString(obj, key) {
    obj[key] = ensureArray(obj[key]);
}
