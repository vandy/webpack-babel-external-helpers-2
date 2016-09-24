const PluginOptions = require('./plugin-options');
const modifyWebpackConfiguration = require('./webpack-configuration');
const injectHelpersModule = require('./inject');

module.exports = WebpackBabelExternalHelpers;

function WebpackBabelExternalHelpers(options = {}) {
    this._options = new PluginOptions(options);
}

WebpackBabelExternalHelpers.prototype.apply = function (compiler) {
    this._options.process(compiler);
    modifyWebpackConfiguration(compiler, this._options);
    injectHelpersModule(compiler, this._options);
};
