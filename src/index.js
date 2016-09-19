const PluginOptions = require('./plugin-options');

module.exports = WebpackBabelExternalHelpers;

function WebpackBabelExternalHelpers(options = {}) {
    this._options = new PluginOptions(options);
}

WebpackBabelExternalHelpers.prototype.apply = function (compiler) {
    this._options.process(compiler);
};
