const modifyLoaders = require('./configuration/loaders');
const modifyEntry = require('./configuration/entry');
const injectHelpersModule = require('./compilation/inject');
const pluginOptionsController = require('../plugin/options');

exports.modifyConfiguration = function (compiler) {
    let modified = modifyConfiguration(compiler.options);
    if (modified) {
        injectHelpersModule(compiler);

        return;
    }

    if (pluginOptionsController.get('strict')) {
        throw new Error('Webpack configuration wasn\'t modified. No babel loaders found.');
    }
};

function modifyConfiguration(configuration) {
    let loadersModified = modifyLoaders(configuration, pluginOptionsController);
    if (loadersModified) {
        modifyEntry(configuration, pluginOptionsController.get('entries'));
    }

    return loadersModified;
}
