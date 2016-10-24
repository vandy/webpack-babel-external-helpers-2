const qs = require('qs');
const {isObject} = require('../../helpers');

module.exports = function modifyLoaders(configuration, pluginOptions) {
    let aliases = getBabelLoaderAliases(pluginOptions);
    let loadersParams = getBabelLoaders(configuration, aliases);
    loadersParams.forEach(loaderParams => addQueryParams(loaderParams, aliases));

    return loadersParams.length > 0;
};

function getBabelLoaderAliases(pluginOptions) {
    return [/(?:^|!)babel(?:(?:-\w+)?-loader)?$/i].concat(pluginOptions.get('aliases'));
}

function getBabelLoaders(configuration, aliases) {
    return getLoaders(configuration).filter(loaderParams => matchLoaders(loaderParams, aliases));
}

function getLoaders(configuration) {
    let loaders = isObject(configuration.module) && configuration.module.loaders;

    return Array.isArray(loaders) ? loaders : [];
}

function matchLoaders(loaderParams, aliases) {
    let loaders = [];
    if (loaderParams.loader && typeof loaderParams.loader === 'string') {
        loaders = loaderParams.loader.split('!');
    } else if (Array.isArray(loaderParams.loaders)) {
        loaders = loaderParams.loaders;
    }

    return extractLoaderNames(loaders).some(loaderName => matchLoaderNameByAliases(loaderName, aliases));
}

function extractLoaderNames(loaderStrings) {
    return loaderStrings.reduce((result, loaderString) => {
        let loaderName = extractLoaderName(loaderString);
        if (loaderName) {
            result.push(loaderName);
        }

        return result;
    }, []);
}

function extractLoaderName(loaderString = '') {
    return loaderString.split('?')[0];
}

function extractLoaderQuery(loaderString = '') {
    const querySignIndex = loaderString.indexOf('?');
    let result = '';
    if (querySignIndex > -1) {
        result = loaderString.substring(querySignIndex + 1);
    }

    return result;
}

function matchLoaderNameByAliases(loaderName, aliases) {
    loaderName = loaderName.toLowerCase();

    return aliases.some(alias => {
        if (alias instanceof RegExp) {
            return alias.test(loaderName);
        }

        return alias.toLowerCase() === loaderName;
    });
}

function addQueryParams(loaderParams, aliases) {
    if (loaderParams.query) {
        loaderParams.query = injectQueryParamsToLoaderQuery(loaderParams.query);

        return;
    }

    let loaderString = (typeof loaderParams.loader === 'string') ? loaderParams.loader : null;
    if (loaderString) {
        loaderParams.loader = injectQueryParamsToLoaderString(loaderString, aliases);
    } else if (Array.isArray(loaderParams.loaders)) {
        loaderParams.loaders = injectQueryParamsToLoadersArray(loaderParams.loaders, aliases);
    }
}

function injectQueryParamsToLoaderQuery(query) {
    const queryObject = getQueryObject(query);
    injectPluginsParams(queryObject);

    return qs.stringify(queryObject, {arrayFormat: 'brackets', encode: false});
}

function getQueryObject(query) {
    if (typeof query === 'string') {
        query = parseQueryString(query);
    }

    return query;
}

function parseQueryString(queryString) {
    if (queryString.charAt(0) === '{' && queryString.charAt(queryString.length - 1) === '}') {
        return JSON.parse(queryString);
    }

    return qs.parse(queryString, {allowDots: true});
}

function injectPluginsParams(query) {
    const helpersPluginRegexp = /(?:^|babel-plugin-)external-helpers$/i;
    const plugins = Array.isArray(query.plugins) ? query.plugins : [];
    if (!plugins.some(pluginName => helpersPluginRegexp.test(pluginName))) {
        plugins.push('external-helpers');
    }
    query.plugins = plugins.filter(Boolean);
}

function injectQueryParamsToLoaderString(loaders, aliases) {
    return injectQueryParamsToLoadersArray(loaders.split('!'), aliases).join('!');
}

function injectQueryParamsToLoadersArray(loaderStrings, aliases) {
    return loaderStrings.map(loaderString => {
        let loaderName = extractLoaderName(loaderString);
        if (!matchLoaderNameByAliases(loaderName, aliases)) {
            return loaderString;
        }

        let queryString = injectQueryParamsToLoaderQuery(extractLoaderQuery(loaderString));

        return `${loaderName}?${queryString}`;
    });
}
