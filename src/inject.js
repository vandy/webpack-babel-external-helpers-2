module.exports = function (compiler, pluginOptions) {
    compiler.plugin('compilation', function (compilation) {
        compilation.plugin('seal', function () {
            injectModule(compiler, compilation, pluginOptions);
        });
    });
};

function injectModule(compiler, compilation, pluginOptions) {}
