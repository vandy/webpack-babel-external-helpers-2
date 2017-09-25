const modifyLoaders = require('./configuration/loaders');
const modifyEntry = require('./configuration/entry');
const inject = require('./compilation/inject');
const pluginOptionsController = require('../plugin/options-controller');

exports.run = function (compiler) {
    compiler.plugin('after-environment', function () {
        ensurePluginSupports(compiler.options);
        modify(compiler);
    });
};

function ensurePluginSupports(configuration) {
    if (typeof configuration.entry === 'function') {
        throw new Error('The plugin doesn\'t work with the entry property being a function.');
    }
}

function modify(compiler) {
    if (modifyConfiguration(compiler.options)) {
        injectIntoCompilation(compiler);

        return;
    }

    if (pluginOptionsController.get('strict')) {
        throw new Error('Webpack configuration wasn\'t modified. No babel loaders found.');
    }
}

function modifyConfiguration(configuration) {
    const modified = modifyLoaders(configuration, {aliases: pluginOptionsController.get('aliases')});
    if (modified) {
        modifyEntry(configuration, {entries: pluginOptionsController.get('entries')});
    }

    return modified;
}

function injectIntoCompilation(compiler) {
    inject(compiler, {
        entries: pluginOptionsController.get('entries'),
        whitelist: pluginOptionsController.get('whitelist'),
    });
}
