const qs = require('qs');
const {isObject} = require('../../helpers');

const BABEL_PLUGIN_REGEXP = /(?:^|babel-plugin-)external-helpers$/i;

module.exports = function setupLoaders(configuration, pluginOptions) {
    return modifyRules(configuration.module, 'rules', getBabelLoaderAliases(pluginOptions.aliases));
};

function getBabelLoaderAliases(userAliases) {
    return [/(?:^|!)babel(?:(?:-\w+)?-loader)?$/i].concat(userAliases);
}

function modifyRules(container, target, aliases) {
    const rulesItem = container[target];
    if (Array.isArray(rulesItem)) {
        return rulesItem
            .map((item, index) => modifyRules(rulesItem, index, aliases))
            .filter(Boolean)
            .length > 0;
    }

    const rule = modifyRulesItem(rulesItem, aliases);
    if (rule) {
        container[target] = rule;
    }

    return Boolean(rule);
}

function modifyRulesItem(rule, aliases) {
    if (typeof rule === 'string') {
        return modifyLoaderString(rule, aliases);
    } else if (isObject(rule)) {
        return modifyRuleObject(rule, aliases);
    }

    return null;
}

function modifyLoaderString(loadersString, aliases) {
    let babelLoaderFound = false;
    const modifiedLoaders = loadersString.split('!').map(loaderString => {
        const loaderName = extractLoaderName(loaderString);
        if (matchLoader(loaderName, aliases)) {
            babelLoaderFound = true;
            const queryString = inject(extractLoaderQuery(loaderString));

            return `${loaderName}?${queryString}`;
        }

        return loaderString;
    }).join('!');

    return babelLoaderFound ? modifiedLoaders : null;
}

function modifyRuleObject(rule, aliases) {
    function modify(field) {
        return rule[field] ? modifyRules(rule, field, aliases) : false;
    }

    const loaderModified = typeof rule.loader === 'string' ? modifyRuleLoader(rule, aliases) : false;
    const propertiesModified = ['use', 'oneOf', 'rules', 'loaders'].filter(modify);

    return (loaderModified || propertiesModified.length > 0) ? rule : null;
}

function modifyRuleLoader(rule, aliases) {
    const loaderString = rule.loader;
    if (!rule.options && !rule.query) {
        const modifiedValue = modifyLoaderString(loaderString, aliases);
        if (modifiedValue) {
            rule.loader = modifiedValue;
        }

        return Boolean(modifiedValue);
    } else if (matchLoader(loaderString, aliases)) {
        if (rule.options) {
            rule.options = inject(rule.options);
        }
        if (rule.query) {
            rule.query = inject(rule.query);
        }

        return true;
    }

    return false;
}

function extractLoaderName(loaderString = '') {
    return loaderString.split('?')[0];
}

function extractLoaderQuery(loaderString = '') {
    const queryIndex = loaderString.indexOf('?');
    if (queryIndex < 0) {
        return '';
    }

    return loaderString.substring(queryIndex + 1);
}

function matchLoader(loaderName, aliases) {
    loaderName = loaderName.toLowerCase();

    return aliases.some(alias => {
        if (alias instanceof RegExp) {
            return alias.test(loaderName);
        }

        return alias.toLowerCase() === loaderName;
    });
}

function inject(query) {
    return qs.stringify(injectPluginParams(getQueryObject(query)), {arrayFormat: 'brackets', encode: false});
}

function injectPluginParams(query) {
    const plugins = Array.isArray(query.plugins) ? query.plugins : [];
    if (!plugins.some(pluginName => BABEL_PLUGIN_REGEXP.test(pluginName))) {
        plugins.push('external-helpers');
    }
    query.plugins = plugins.filter(Boolean);

    return query;
}

function getQueryObject(query) {
    if (typeof query === 'string') {
        return parseQueryString(query);
    }

    return query;
}

function parseQueryString(queryString) {
    if (queryString.charAt(0) === '{' && queryString.charAt(queryString.length - 1) === '}') {
        return JSON.parse(queryString);
    }

    return qs.parse(queryString, {allowDots: true});
}
