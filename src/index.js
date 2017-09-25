const pluginOptionsController = require('./plugin/options-controller');
const webpackModification = require('./webpack-modification');

function WebpackBabelExternalHelpers(userOptions) {
    this._userOptions = userOptions;
}

WebpackBabelExternalHelpers.prototype.apply = function (compiler) {
    pluginOptionsController.run(compiler, this._userOptions);
    webpackModification.run(compiler);
};

module.exports = WebpackBabelExternalHelpers;
