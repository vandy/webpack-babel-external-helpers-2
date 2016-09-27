const {isObject, ensureArray} = require('../../helpers');

module.exports = function modifyEntry(configuration, onlyEntries) {
    let entry = configuration && configuration.entry;
    if (entry) {
        ensureEntryPointIsArray(configuration, 'entry', onlyEntries);
    }
};

function ensureEntryPointIsArray(container, entryName, onlyEntries) {
    let entry = container[entryName];
    if (typeof entry === 'string') {
        if (!onlyEntries.length || onlyEntries.indexOf(entryName) > -1) {
            replaceEntryString(container, entryName);
        }

        return;
    }
    if (isObject(entry)) {
        Object.keys(entry).forEach(entryName => ensureEntryPointIsArray(entry, entryName, onlyEntries));
    }
}

function replaceEntryString(obj, key) {
    obj[key] = ensureArray(obj[key]);
}
