const modifyEntry = require('./entry');
const setupLoaders = require('./loaders');

module.exports = function modifyConfiguration(configuration, pluginOptions) {
    const loadersSetup = setupLoaders(configuration, {aliases: pluginOptions.get('aliases')});
    if (loadersSetup) {
        modifyEntry(configuration, {entries: pluginOptions.get('entries')});
    }

    return loadersSetup;
};
