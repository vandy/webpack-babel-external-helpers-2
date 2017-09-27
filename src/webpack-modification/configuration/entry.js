const {isObject, ensureArray} = require('../../helpers');

module.exports = function modifyEntry(configuration, pluginOptions) {
    return ensureEntryIsArray(configuration, pluginOptions.entries);
};

function ensureEntryIsArray(configuration, onlySpecificEntries) {
    const entry = configuration.entry;
    if (isObject(entry)) {
        return modifyEntryObject(entry, onlySpecificEntries);
    } else if (typeof entry === 'string') {
        replaceWithArray(configuration, 'entry');

        return true;
    }

    return Array.isArray(entry);
}

function modifyEntryObject(entry, onlyEntries) {
    const entryNames = Object.keys(entry);
    if (!onlyEntries.length) {
        entryNames.forEach(entryName => replaceWithArray(entry, entryName));

        return true;
    }

    return entryNames.reduce((matches, entryName) => {
        if (onlyEntries.indexOf(entryName) > -1) {
            replaceWithArray(entry, entryName);
            matches++;
        }

        return matches;
    }, 0) > 0;
}

function replaceWithArray(obj, key) {
    obj[key] = ensureArray(obj[key]);
}
