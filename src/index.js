const pluginOptionsController = require('./plugin/options');
const webpackModification = require('./webpack-modification');

module.exports = WebpackBabelExternalHelpers;

function WebpackBabelExternalHelpers(options = {}) {
    this._options = options;
}

WebpackBabelExternalHelpers.prototype.apply = function (compiler) {
    pluginOptionsController.init(compiler, this._options);
    modifyConfiguration(compiler);
};

function modifyConfiguration(compiler) {
    let configurationModified = webpackModification.modifyConfiguration(compiler);
    if (pluginOptionsController.get('strict') && !configurationModified) {
        throw new Error('Plugin hasn\'t modified the configuration. No babel loaders found.');
    }
    webpackModification.injectModules(compiler);
}
