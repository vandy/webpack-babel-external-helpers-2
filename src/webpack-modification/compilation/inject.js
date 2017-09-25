const babelCore = require('babel-core');
const RawModule = require('webpack/lib/RawModule');
const SingleEntryDependencyWrapper = require('../SingleEntryDependencyWrapper');
const Symbol = require('symbol');
const NullFactory = require('webpack/lib/NullFactory');

const moduleIdentifierSymbol = Symbol('topLevelModuleIdentifier');

module.exports = function (compiler, pluginOptions) {
    compiler.plugin('compilation', function (compilation) {
        inject(compilation, pluginOptions);
    });
};

function inject(compilation, pluginOptions) {
    compilation.dependencyFactories.set(SingleEntryDependencyWrapper, new NullFactory());
    compilation.plugin('seal', function () {
        getChunks(this, pluginOptions.entries)
            .forEach(chunk => injectHelpers(this, chunk.module, pluginOptions.whitelist));
    });
}

function getChunks(compilation, onlyEntries) {
    const chunks = compilation.preparedChunks;
    if (onlyEntries.length < 1) {
        return chunks;
    }

    return chunks.filter(chunk => onlyEntries.indexOf(chunk.name) > -1);
}

function injectHelpers(compilation, topLevelModule, babelHelpersWhitelist) {
    const dependency = getDependency(topLevelModule);
    const [module, fromCache] = addModule(compilation, createHelpersModule(dependency, babelHelpersWhitelist));
    link(topLevelModule, module, dependency);
    if (!fromCache) {
        topLevelModule.dependencies.unshift(dependency);
        compilation.buildModule(module, false, topLevelModule, [dependency], error => {
            if (error) {
                throw new Error('Helpers module is not build.');
            }
        });
    }
}

function addModule(compilation, module) {
    const added = compilation.addModule(module);
    const cached = added !== true;
    if (added === false) {
        module = compilation.getModule(module);
    } else if (added instanceof RawModule) {
        module = added;
    }

    return [module, cached];
}

function getDependency(module) {
    return findInjectedDependency(module) || createDependency(module);
}

function findInjectedDependency(module) {
    return module.dependencies.filter(dependency => dependency instanceof SingleEntryDependencyWrapper)[0];
}

function createDependency(module) {
    const dependency = new SingleEntryDependencyWrapper('babel-loader-external-helpers');
    dependency.loc = module.name + ":" + (100000 - 1);
    dependency[moduleIdentifierSymbol] = module.identifier();

    return dependency;
}

function createHelpersModule(dependency, whitelist) {
    return new RawModule(buildBabelHelpers(whitelist), getModuleIdentifier(dependency));
}

function buildBabelHelpers(whitelist) {
    if (whitelist.length) {
        return babelCore.buildExternalHelpers(whitelist);
    }

    return babelCore.buildExternalHelpers();
}

function getModuleIdentifier(dependency) {
    return 'generated babel-helpers ' + dependency[moduleIdentifierSymbol];
}

function link(topLevelModule, module, dependecy) {
    module.issuer = topLevelModule.identifier();
    dependecy.module = module;
    module.addReason(topLevelModule, dependecy);
}
