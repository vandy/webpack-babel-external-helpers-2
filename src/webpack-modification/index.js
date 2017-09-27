const modifyCompilation = require('./compilation');
const modifyConfiguration = require('./configuration');
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
    if (modifyConfiguration(compiler.options, pluginOptionsController)) {
        modifyCompilation(compiler, pluginOptionsController);

        return;
    }

    if (pluginOptionsController.get('strict')) {
        throw new Error('Webpack configuration wasn\'t modified. No babel loaders found.');
    }
}
