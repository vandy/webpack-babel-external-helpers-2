'use strict';

const chai = require('chai');
const qs = require('qs');
const assert = chai.assert;
const PluginController = require('../src/plugin/options');
const modifyLoaders = require('../src/webpack-modification/configuration/loaders');

describe('Babel-loader is not specified in configuration.', function () {
    it('Configuration is not changed, false value is returned', function () {
        const compiler = {options: {
            entry: './main.js',
            module: {
                loaders: [{
                    test: /\.js$/,
                    loader: 'not-babel-loader',
                }],
            },
        }};
        PluginController.init(compiler);

        let result = true;
        let functionModifies = function () {
            result = modifyLoaders(compiler.options, PluginController);
        };
        let objectToBeModified = compiler.options.module.loaders[0];

        assert.doesNotChange(functionModifies, objectToBeModified, 'loader');
        assert.isFalse(result);
    });
});

describe('Babel-loader is specified, "plugins[]=external-helpers" query parameter injection.', function () {
    describe('Query parameters property is specified (only "loader" property is allowed).', function () {
        it('String, doesn\'t contain external-helpers', function () {
            const compiler = {options: {
                entry: './main.js',
                module: {
                    loaders: [{
                        test: /\.js$/,
                        loader: 'babel',
                        query: 'presets[]=es2015',
                    }],
                },
            }};
            PluginController.init(compiler);

            let functionModifies = function () {
                modifyLoaders(compiler.options, PluginController);
            };
            let babelLoaderParams = compiler.options.module.loaders[0];

            assert.changes(functionModifies, babelLoaderParams, 'query');

            let parameters = qs.parse(babelLoaderParams.query, {allowDots: true});

            assert.deepEqual(parameters, {plugins: ['external-helpers'], presets: ['es2015']});
        });

        it('String, contains external-helpers', function () {
            const compiler = {options: {
                entry: './main.js',
                module: {
                    loaders: [{
                        test: /\.js$/,
                        loader: 'babel',
                        query: 'presets[]=es2015&plugins[]=babel-plugin-external-helpers',
                    }],
                },
            }};
            PluginController.init(compiler);

            let functionModifies = function () {
                modifyLoaders(compiler.options, PluginController);
            };
            let babelLoaderParams = compiler.options.module.loaders[0];

            assert.doesNotChange(functionModifies, babelLoaderParams, 'query');
        });

        it('Object, doesn\'t contain external-helpers', function () {
            const compiler = {options: {
                entry: './main.js',
                module: {
                    loaders: [{
                        test: /\.js$/,
                        loader: 'babel',
                        query: {
                            presets: ['es2015'],
                        },
                    }],
                },
            }};
            PluginController.init(compiler);

            let functionModifies = function () {
                modifyLoaders(compiler.options, PluginController);
            };
            let babelLoaderParams = compiler.options.module.loaders[0];

            assert.changes(functionModifies, babelLoaderParams, 'query');
            assert.isString(babelLoaderParams.query);
            assert.match(babelLoaderParams.query, /plugins\[]=external-helpers/);
        });

        it('Object, contains external-helpers', function () {
            const compiler = {options: {
                entry: './main.js',
                module: {
                    loaders: [{
                        test: /\.js$/,
                        loader: 'babel',
                        query: {
                            presets: ['es2015'],
                            plugins: ['transform-regenerator', 'external-helpers'],
                        },
                    }],
                },
            }};
            PluginController.init(compiler);

            let functionModifies = function () {
                modifyLoaders(compiler.options, PluginController);
            };
            let babelLoaderParams = compiler.options.module.loaders[0];

            assert.changes(functionModifies, babelLoaderParams, 'query');
            assert.isString(babelLoaderParams.query);
            assert.match(babelLoaderParams.query, /plugins\[]=external-helpers/);
        });
    });

    describe('Query parameters property is NOT specified.', function () {
        it('"loader" property: single loader, no inline query parameters', function () {
            const compiler = {options: {
                entry: './main.js',
                module: {
                    loaders: [{
                        test: /\.js$/,
                        loader: 'babel',
                    }],
                },
            }};
            PluginController.init(compiler);

            let functionModifies = function () {
                modifyLoaders(compiler.options, PluginController);
            };
            let objectToBeModified = compiler.options.module.loaders[0];

            assert.changes(functionModifies, objectToBeModified, 'loader');
            assert.strictEqual(objectToBeModified.loader, 'babel?plugins[]=external-helpers');
        });

        it('"loader" property: single loader with inline query parameters', function () {
            const compiler = {options: {
                entry: './main.js',
                module: {
                    loaders: [{
                        test: /\.js$/,
                        loader: 'babel?plugins[]=transform-runtime',
                    }],
                },
            }};
            PluginController.init(compiler);

            let functionModifies = function () {
                modifyLoaders(compiler.options, PluginController);
            };
            let babelLoaderParams = compiler.options.module.loaders[0];

            assert.changes(functionModifies, babelLoaderParams, 'loader');

            let parameters = qs.parse(babelLoaderParams.loader.split('?').pop(), {allowDots: true});

            assert.deepEqual(parameters, {plugins: ['transform-runtime', 'external-helpers']});
        });

        it('"loader" property: multiple loaders, no inline query parameters', function () {
            const compiler = {options: {
                entry: './main.js',
                module: {
                    loaders: [{
                        test: /\.js$/,
                        loader: 'babel!raw-text',
                    }],
                },
            }};
            PluginController.init(compiler);

            let functionModifies = function () {
                modifyLoaders(compiler.options, PluginController);
            };
            let babelLoaderParams = compiler.options.module.loaders[0];
            let propertyChanged = 'loader';

            assert.changes(functionModifies, babelLoaderParams, propertyChanged);
            assert.isString(babelLoaderParams[propertyChanged]);
            assert.match(babelLoaderParams[propertyChanged], /^babel\?plugins\[]=external-helpers!raw-text/);
        });

        it('"loader" property: multiple loaders with inline query parameters', function () {
            const compiler = {options: {
                entry: './main.js',
                module: {
                    loaders: [{
                        test: /\.js$/,
                        loader: 'babel?presets[]=es2015!imports-loader',
                    }],
                },
            }};
            PluginController.init(compiler);

            let functionModifies = function () {
                modifyLoaders(compiler.options, PluginController);
            };
            let babelLoaderParams = compiler.options.module.loaders[0];
            let propertyChanged = 'loader';

            assert.changes(functionModifies, babelLoaderParams, propertyChanged);
            assert.isString(babelLoaderParams[propertyChanged]);
            assert.match(babelLoaderParams[propertyChanged], /plugins\[]=external-helpers/);
        });

        it('"loaders" property: no inline query parameters', function () {
            const compiler = {options: {
                entry: './main.js',
                module: {
                    loaders: [{
                        test: /\.js$/,
                        loaders: ['imports-loader', 'babel'],
                    }],
                },
            }};
            PluginController.init(compiler);

            let functionModifies = function () {
                modifyLoaders(compiler.options, PluginController);
            };
            let babelLoaderParams = compiler.options.module.loaders[0];
            let propertyChanged = 'loaders';

            assert.changes(functionModifies, babelLoaderParams, propertyChanged);
            assert.isArray(babelLoaderParams[propertyChanged]);
            assert.oneOf('babel?plugins[]=external-helpers', babelLoaderParams[propertyChanged]);
        });

        it('"loaders" property: inline query parameters', function () {
            const compiler = {options: {
                entry: './main.js',
                module: {
                    loaders: [{
                        test: /\.js$/,
                        loaders: ['imports-loader', 'babel?presets[]=es2015'],
                    }],
                },
            }};
            PluginController.init(compiler);

            let functionModifies = function () {
                modifyLoaders(compiler.options, PluginController);
            };
            let babelLoaderParams = compiler.options.module.loaders[0];
            let propertyChanged = 'loaders';

            assert.changes(functionModifies, babelLoaderParams, propertyChanged);
            assert.isArray(babelLoaderParams[propertyChanged]);
            assert.oneOf('babel?presets[]=es2015&plugins[]=external-helpers', babelLoaderParams[propertyChanged]);
        });
    });
});

describe('Babel-loader specified with alias', function () {
    it('"aliases" option is used, configuration is changed, true is returned', function () {
        const compiler = {options: {
            entry: './main.js',
            module: {
                loaders: [{
                    test: /\.js$/,
                    loader: 'babel-alias',
                }],
            },
            resolveLoader: {
                alias: {
                    'babel-alias': 'babel',
                }
            },
        }};
        PluginController.init(compiler, {aliases: ['babel-alias']});

        let result = false;
        let functionModifies = function () {
            result = modifyLoaders(compiler.options, PluginController);
        };
        let babelLoaderParams = compiler.options.module.loaders[0];
        let propertyChanged = 'loader';

        assert.changes(functionModifies, babelLoaderParams, propertyChanged);
        assert.isTrue(result);
    });
});
