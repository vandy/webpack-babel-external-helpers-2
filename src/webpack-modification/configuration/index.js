const modifyEntry = require('./entry');
const setupLoaders = require('./loaders');

module.exports = function modifyConfiguration(configuration, pluginOptions) {
    return modifyConfigurationEntry(configuration, pluginOptions) &&
        setupConfigurationLoaders(configuration, pluginOptions);
};

function modifyConfigurationEntry(configuration, pluginOptions) {
    const modified = modifyEntry(configuration, {entries: pluginOptions.get('entries')});
    if (!modified && pluginOptions.get('strict')) {
        throw new Error('Webpack configuration wasn\'t modified. ' +
            'Specified entries were not found in the configuration.');
    }

    return modified;
}

function setupConfigurationLoaders(configuration, pluginOptions) {
    const setup = setupLoaders(configuration, {aliases: pluginOptions.get('aliases')});
    if (!setup && pluginOptions.get('strict')) {
        throw new Error('Webpack configuration wasn\'t modified. ' +
            'No babel-loader found.');
    }

    return setup;
}
