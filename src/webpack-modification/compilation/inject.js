const babelCore = require('babel-core');
const RawModule = require('webpack/lib/RawModule');
const SingleEntryDependency = require('webpack/lib/dependencies/SingleEntryDependency');
const Symbol = require('symbol');
const NullFactory = require('webpack/lib/NullFactory');
const pluginOptionsController = require('../../plugin/options');

const moduleIdentifierSymbol = Symbol('topLevelModuleIdentifier');

module.exports = function (compiler) {
    compiler.plugin('compilation', handleCompilation);
};

function handleCompilation(compilation) {
    compilation.dependencyFactories.set(SingleEntryDependency, new NullFactory());
    compilation.plugin('seal', modifyChunks);
}

function modifyChunks() {
    getChunks(this).forEach(chunk => injectHelpers(this, chunk.module));
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
    let dependency = getDependency(topLevelModule);
    let module = createModule(dependency);
    let cachedModule = compilation.addModule(module);
    let cached = false;
    if (cachedModule && typeof cachedModule !== 'boolean') {
        cached = true;
        module = cachedModule;
    }
    linkModules(topLevelModule, module, dependency);
    if (!cached) {
        topLevelModule.dependencies.unshift(dependency);
        compilation.buildModule(module, (error) => {
            if (error) {
                throw new Error('Helpers module is not build.');
            }
        });
    }
}

function getDependency(topLevelModule) {
    return findInjectedDependency(topLevelModule) || createDependency(topLevelModule);
}

function findInjectedDependency(topLevelModule) {
    return topLevelModule.dependencies.filter(dependency => dependency instanceof SingleEntryDependency)[0];
}

function createDependency(topLevelModule) {
    let dependency = new SingleEntryDependency('babel-loader-external-helpers');
    dependency.loc = topLevelModule.name + ":" + (100000 - 1);
    dependency[moduleIdentifierSymbol] = topLevelModule.identifier();

    return dependency;
}

function createModule(dependency) {
    return new RawModule(buildBabelHelpers(), getModuleIdentifier(dependency));
}

function buildBabelHelpers() {
    let whitelistArgument;
    let whitelist = pluginOptionsController.get('whitelist');
    if (whitelist.length) {
        whitelistArgument = whitelist;
    }

    return babelCore.buildExternalHelpers(whitelistArgument);
}

function getModuleIdentifier(dependency) {
    return 'generated babel-helpers ' + dependency[moduleIdentifierSymbol];
}

function linkModules(topLevelModule, module, dependecy) {
    module.issuer = topLevelModule.identifier();
    dependecy.module = module;
    module.addReason(topLevelModule, dependecy);
}
