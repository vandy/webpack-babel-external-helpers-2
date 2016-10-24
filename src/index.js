const pluginOptionsController = require('./plugin/options');
const webpackModification = require('./webpack-modification');

module.exports = WebpackBabelExternalHelpers;

function WebpackBabelExternalHelpers(options = {}) {
    this._options = options;
}

WebpackBabelExternalHelpers.prototype.apply = function (compiler) {
    pluginOptionsController.init(compiler, this._options);
    webpackModification.modifyConfiguration(compiler);
};
