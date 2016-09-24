const PluginOptions = require('./plugin-options');
const modifyWebpackConfiguration = require('./webpack-configuration');
const injectHelpersModule = require('./inject');

module.exports = WebpackBabelExternalHelpers;

function WebpackBabelExternalHelpers(options = {}) {
    this._options = new PluginOptions(options);
}

WebpackBabelExternalHelpers.prototype.apply = function (compiler) {
    this._options.process(compiler);
    modifyConfiguration(compiler, this._options);
    injectHelpersModule(compiler, this._options);
};

function modifyConfiguration(compiler, pluginOptions) {
    let configurationModified = modifyWebpackConfiguration(compiler, pluginOptions);
    if (pluginOptions.get('strict') && !configurationModified) {
        throw new Error('Plugin hasn\'t modified the configuration. No babel loaders found.');
    }
}
