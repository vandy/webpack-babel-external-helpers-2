const inject = require('./inject');

module.exports = function modifyCompilation(compiler, pluginOptions) {
    inject(compiler, {
        entries: pluginOptions.get('entries'),
        whitelist: pluginOptions.get('whitelist'),
    });
};
