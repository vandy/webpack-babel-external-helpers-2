const babelCore = require('babel-core');
const RawModule = require('webpack/lib/RawModule');
const SingleEntryDependency = require('webpack/lib/dependencies/SingleEntryDependency');
const pluginOptionsController = require('../../plugin/options');

module.exports = function (compiler) {
    compiler.plugin('compilation', function (compilation) {
        compilation.plugin('seal', function () {
            modifyChunks(compilation);
        });
    });
};

function modifyChunks(compilation) {
    getChunks(compilation).forEach(chunk => injectHelpers(compilation, chunk.module));
}

function getChunks(compilation) {
    let addToSpecificEntries = pluginOptionsController.get('entries');
    let chunks = compilation.preparedChunks;
    if (addToSpecificEntries.length) {
        return chunks.filter(chunk => addToSpecificEntries.indexOf(chunk.name) > -1);
    }

    return chunks;
}

function injectHelpers(compilation, topLevelModule) {
    let dependency = createDependency();
    let module = createModule();
    compilation.addModule(module);
    linkModules(topLevelModule, module, dependency);
    compilation.buildModule(module, (error) => {
        if (error) {
            throw new Error('Helpers module is not build.');
        }
    });
}

function createDependency() {
    return new SingleEntryDependency('babel-loader-external-helpers');
}

function createModule() {
    return new RawModule(buildBabelHelpers(), 'generated babel-helpers');
}

function buildBabelHelpers() {
    let whitelistArgument;
    let whitelist = pluginOptionsController.get('whitelist');
    if (whitelist.length) {
        whitelistArgument = whitelist;
    }

    return babelCore.buildExternalHelpers(whitelistArgument);
}

function linkModules(topLevelModule, module, dependecy) {
    module.issuer = topLevelModule.identifier();
    dependecy.module = module;
    module.addReason(topLevelModule, dependecy);
    topLevelModule.dependencies.unshift(dependecy);
}
