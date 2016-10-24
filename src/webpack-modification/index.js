const modifyLoaders = require('./configuration/loaders');
const modifyEntry = require('./configuration/entry');
const injectHelpersModule = require('./compilation/inject');
const pluginOptionsController = require('../plugin/options');

exports.modifyConfiguration = function (compiler) {
    let configuration = compiler.options;
    if (modifyLoaders(configuration, pluginOptionsController)) {
        modifyEntry(configuration, pluginOptionsController.get('entries'));

        return true;
    }

    return false;
};

exports.injectModules = function (compiler) {
    injectHelpersModule(compiler, pluginOptionsController);
};
