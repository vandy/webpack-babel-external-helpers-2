const modifyLoaders = require('./configuration/loaders');
const modifyEntry = require('./configuration/entry');
const injectHelpersModule = require('./compilation/inject');

exports.modifyConfiguration = function (compiler, pluginOptions) {
    let configuration = compiler.options;
    if (modifyLoaders(configuration, pluginOptions)) {
        modifyEntry(configuration, pluginOptions.get('entries'));

        return true;
    }

    return false;
};

exports.injectModules = function (compiler, pluginOptions) {
    injectHelpersModule(compiler, pluginOptions);
};
