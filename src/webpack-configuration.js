const {isObject, ensureArray} = require('./helpers');

module.exports = function modifyWebpackConfiguration(compiler, pluginOptions) {
    let configuration = compiler.options;
    if (includeExternalHelpersPlugin(configuration)) {
        fixConfigurationEntry(configuration, pluginOptions.get('entries'));

        return true;
    }

    return false;
};

function includeExternalHelpersPlugin(configuration) {
    let aliases = getBabelLoaderAliases(configuration);
    let loadersParams = getBabelLoaders(configuration, aliases);
    loadersParams.forEach(loaderParams => addQueryParam(loaderParams, aliases));

    return loadersParams.length > 0;
}

function getBabelLoaderAliases(configuration) {
    return [/(^|!)babel(-loader)?/i];
}

function getBabelLoaders(configuration, aliases) {
    return getLoaders(configuration)
        .filter(loaderParams => matchLoaderByAlias(loaderParams, aliases));
}

function getLoaders(configuration) {
    let loaders = isObject(configuration.module) && configuration.module.loaders;

    return Array.isArray(loaders) ? loaders : [];
}

function matchLoaderByAlias(loaderParams, aliases) {
    return extractLoaderNames(loaderParams).some(loaderName => {
        return aliases.some(alias => {
            if (alias instanceof RegExp) {
                return alias.test(loaderName);
            }

            return alias === loaderName;
        });
    });
}

function extractLoaderNames(loaderParams) {
    let loaders = Array.isArray(loaderParams.loaders) ? loaderParams.loaders : [];
    if (loaderParams.loader && typeof loaderParams.loader === 'string') {
        loaders = loaderParams.loader.split('!');
    }

    return loaders.reduce((result, loaderString) => {
        let loaderName = loaderString && loaderString.split('?')[0];
        if (loaderName) {
            result.push(loaderName);
        }

        return result;
    }, []);
}

// TODO: implement
function addQueryParam(loaderParams, aliases) {
    if (loaderParams.query) {
        addQueryParamToLoaderQuery(loaderParams);

        return;
    }

    if (typeof loaderParams.loader === 'string') {
        loaderParams.loader = addQueryParamToLoaderString(loaderParams.loader, aliases);
    } else if (Array.isArray(loaderParams.loaders)) {
        addQueryParamToLoadersArray(loaderParams, aliases);
    }
}

// TODO: implement
function addQueryParamToLoaderString(loaderString, aliases) {
    return loaderString;
}

// TODO: implement
function addQueryParamToLoadersArray(loaderParams, aliases) {
    return loaderParams;
}

// TODO: implement
function addQueryParamToLoaderQuery(loaderParams) {
}

function fixConfigurationEntry(configuration, onlyEntries) {
    let entry = configuration && configuration.entry;
    if (entry) {
        ensureEntryPointIsArray(configuration, 'entry', onlyEntries);
    }
}

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
