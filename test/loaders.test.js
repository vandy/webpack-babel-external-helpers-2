'use strict';

const chai = require('chai');
const qs = require('qs');
const assert = chai.assert;
const setupLoaders = require('../src/webpack-modification/configuration/loaders');

describe('Webpack configuration modification: babel-loader options', function () {
    describe('babel-loader is not specified in module.rules', function () {
        const pluginOptions = {
            aliases: [],
        };

        describe('module.rules is a string', function () {
            it('should not change the configuration', function () {
                const configuration = {
                    module: {
                        rules: 'not-babel-loader',
                    },
                };

                function modify() {
                    setupLoaders(configuration, pluginOptions);
                }

                assert.doesNotChange(modify, configuration.module, 'rules');
            });

            it('should return false', function () {
                const configuration = {
                    module: {
                        rules: 'not-babel-loader',
                    },
                };

                assert.isFalse(setupLoaders(configuration, pluginOptions));
            })
        });

        describe('module.rules is an object', function () {
            it('should not change the configuration', function () {
                const configuration = {
                    module: {
                        rules: {
                            test: /\.js$/i,
                            loader: 'not-babel-loader',
                        },
                    },
                };

                function modify() {
                    setupLoaders(configuration, pluginOptions);
                }

                assert.doesNotChange(modify, configuration.module.rules, 'loader');
            });

            it('should return false', function () {
                const configuration = {
                    module: {
                        rules: {
                            test: /\.js$/i,
                            loader: 'not-babel-loader',
                        },
                    },
                };

                assert.isFalse(setupLoaders(configuration, pluginOptions));
            });
        });

        describe('module.rules is an array', function () {
            it('should not change the configuration', function () {
                const configuration = {
                    module: {
                        rules: [{
                            test: /\.js$/i,
                            loader: 'not-babel-loader',
                        }],
                    },
                };

                function modify() {
                    setupLoaders(configuration, pluginOptions);
                }

                assert.doesNotChange(modify, configuration.module.rules[0], 'loader');
            });

            it('should return false', function () {
                const configuration = {
                    module: {
                        rules: [{
                            test: /\.js$/i,
                            loader: 'not-babel-loader',
                        }],
                    },
                };

                assert.isFalse(setupLoaders(configuration, pluginOptions));
            });
        });
    });

    describe('babel-loader is specified in module.rules', function () {
        const pluginOptions = {
            aliases: [],
        };

        describe('module.rules is a string', function () {
            describe('one loader without query params', function () {
                it('should add query params to the loader string', function () {
                    const configuration = {
                        module: {
                            rules: 'babel-loader',
                        },
                    };
                    setupLoaders(configuration, pluginOptions);

                    assert.strictEqual(configuration.module.rules, 'babel-loader?plugins[]=external-helpers');
                });
            });

            describe('one loader with query params, external-helpers are not specified', function () {
                it('should inject external-helpers into query params', function () {
                    const configuration = {
                        module: {
                            rules: 'babel-loader?presets[]=es2015',
                        },
                    };
                    setupLoaders(configuration, pluginOptions);

                    assert.deepEqual(
                        qs.parse(configuration.module.rules.split('?').pop(), {allowDots: true}),
                        {plugins: ['external-helpers'], presets: ['es2015']}
                    );
                });
            });

            describe('one loader with query params, external-helpers are specified', function () {
                it('should not change the loader string', function () {
                    const configuration = {
                        module: {
                            rules: 'babel-loader?presets[]=es2015&plugins[]=babel-plugin-external-helpers',
                        },
                    };

                    function modify() {
                        setupLoaders(configuration, pluginOptions);
                    }

                    assert.doesNotChange(modify, configuration.module, 'rules');
                });
            });

            describe('several loaders without query params', function () {
                it('should add query params to babel-loader only', function () {
                    const configuration = {
                        module: {
                            rules: 'babel-loader!other-loader',
                        },
                    };
                    setupLoaders(configuration, pluginOptions);
                    const loaders = configuration.module.rules.split('!');

                    assert.lengthOf(loaders, 2, 'number of loaders should remain the same');
                    assert.sameMembers(loaders, ['babel-loader?plugins[]=external-helpers', 'other-loader']);
                });
            });

            describe('several loaders with query params, external-helpers are not specified', function () {
                it('should inject external-helpers into query params of babel-loader only', function () {
                    const configuration = {
                        module: {
                            rules: 'babel-loader?presets[]=es2015!other-loader?key=val',
                        },
                    };
                    setupLoaders(configuration, pluginOptions);
                    const loaders = configuration.module.rules.split('!');

                    assert.lengthOf(loaders, 2, 'number of loaders should remain the same');
                    assert.oneOf('other-loader?key=val', loaders, 'other loaders params should stay intact');

                    const babelLoader = loaders.filter(loaderString => /babel-loader/i.test(loaderString))[0];

                    assert.isString(babelLoader, 'modified rules should contain babel-loader string');
                    assert.deepEqual(
                        qs.parse(babelLoader.split('?').pop(), {allowDots: true}),
                        {plugins: ['external-helpers'], presets: ['es2015']}
                    );
                });
            });

            describe('several loaders with query params, external-helpers are specified', function () {
                it('should not change the loaders string', function () {
                    const configuration = {
                        module: {
                            rules: 'babel-loader?presets[]=es2015&plugins[]=babel-plugin-external-helpers!other-loader?key=val',
                        },
                    };

                    function modify() {
                        setupLoaders(configuration, pluginOptions);
                    }

                    assert.doesNotChange(modify, configuration.module, 'rules');
                });
            });
        });

        describe('module.rules is an object', function () {
            it('should return false ' +
                'if no "loader", "loaders", "use", "oneOf", "rules" properties', function () {
                const configuration = {
                    module: {
                        rules: {},
                    },
                };

                assert.isFalse(setupLoaders(configuration, pluginOptions));
            });

            describe('"loader" property', function () {
                it('string: should inject query params to the string', function () {
                    const configuration = {
                        module: {
                            rules: {
                                loader: 'babel-loader',
                            },
                        },
                    };

                    assert.isTrue(setupLoaders(configuration, pluginOptions));
                    assert.strictEqual(configuration.module.rules.loader, 'babel-loader?plugins[]=external-helpers');
                });

                it('object: should return false', function () {
                    const configuration = {
                        module: {
                            rules: {
                                loader: {
                                    loader: 'babel-loader',
                                }
                            },
                        },
                    };

                    assert.isFalse(setupLoaders(configuration, pluginOptions));
                });
            });

            describe('"loader" and "options" properties', function () {
                describe('"options" is a string', function () {
                    it.skip('json string: should inject "external-helpers" if missing');

                    it('query string: should inject "external-helpers", if missing', function () {
                        const configuration = {
                            module: {
                                rules: {
                                    loader: 'babel-loader',
                                    options: 'presets[]=es2015',
                                },
                            },
                        };

                        assert.isTrue(setupLoaders(configuration, pluginOptions));
                        assert.deepEqual(
                            qs.parse(configuration.module.rules.options, {allowDots: true}),
                            {plugins: ['external-helpers'], presets: ['es2015']}
                        );
                    });

                    it('should not change "options", if "external-helpers" are specified', function () {
                        const configuration = {
                            module: {
                                rules: {
                                    loader: 'babel-loader',
                                    options: 'presets[]=es2015&plugins[]=babel-plugin-external-helpers',
                                },
                            },
                        };

                        function modify() {
                            setupLoaders(configuration, pluginOptions);
                        }

                        assert.doesNotChange(modify, configuration.module.rules, 'options');
                    });
                });

                describe('"options" is an object', function () {
                    it('should stay an object', function () {
                        const configuration = {
                            module: {
                                rules: {
                                    loader: 'babel-loader',
                                    options: {
                                        presets: ['es2015'],
                                    },
                                },
                            },
                        };
                        setupLoaders(configuration, pluginOptions);

                        assert.isObject(configuration.module.rules.options);
                    });

                    it('should inject "external-helpers" to plugins array if missing', function () {
                        const configuration = {
                            module: {
                                rules: {
                                    loader: 'babel-loader',
                                    options: {
                                        presets: ['es2015'],
                                    },
                                },
                            },
                        };
                        setupLoaders(configuration, pluginOptions);
                        const options = configuration.module.rules.options;

                        assert.property(options, 'plugins');
                        assert.isArray(options.plugins);
                        assert.oneOf('external-helpers', options.plugins);
                    });
                });
            });

            describe('"loaders" property', function () {
                it('array, no query params: should add query params to babel-loader only', function () {
                    const configuration = {
                        module: {
                            rules: {
                                loaders: ['other-loader', 'babel-loader'],
                            },
                        },
                    };
                    const rules = configuration.module.rules;
                    const target = 'loaders';

                    setupLoaders(configuration, pluginOptions);

                    assert.isArray(rules[target]);
                    assert.sameMembers(rules[target], ['babel-loader?plugins[]=external-helpers', 'other-loader']);
                });

                it('array, query params: should inject external-helpers into babel-loader query params', function () {
                    const configuration = {
                        module: {
                            rules: {
                                loaders: ['other-loader?key=val', 'babel-loader?plugins[]=transform-runtime'],
                            },
                        },
                    };
                    setupLoaders(configuration, pluginOptions);
                    const resultLoaders = configuration.module.rules.loaders;

                    assert.lengthOf(resultLoaders, 2, 'number of loaders should remain the same');
                    assert.oneOf('other-loader?key=val', resultLoaders, 'other loaders params should stay intact');

                    const babelLoader = resultLoaders.filter(loaderString => /babel-loader/i.test(loaderString))[0];

                    assert.isString(babelLoader, 'modified rules should contain babel-loader string');
                    assert.deepEqual(
                        qs.parse(babelLoader.split('?').pop(), {allowDots: true}),
                        {plugins: ['transform-runtime', 'external-helpers']}
                    );
                });
            });

            describe('"use" property', function () {
                it('should modify and return true if the property contains babel-loader', function () {
                    const configuration = {
                        module: {
                            rules: {
                                use: 'babel-loader',
                            },
                        },
                    };

                    assert.isTrue(setupLoaders(configuration, pluginOptions));
                });
            });

            describe('"oneOf" property', function () {
                it('should modify and return true if the property contains babel-loader', function () {
                    const configuration = {
                        module: {
                            rules: {
                                test: /\.js/i,
                                oneOf: [
                                    {
                                        use: 'babel-loader',
                                    },
                                    {
                                        use: 'other-loader',
                                    },
                                ],
                            },
                        },
                    };

                    assert.isTrue(setupLoaders(configuration, pluginOptions));
                });
            });

            describe('"rules" property', function () {
                it('should modify and return true if the property contains babel-loader', function () {
                    const configuration = {
                        module: {
                            rules: {
                                test: /\.js/i,
                                use: 'other-loader',
                                rules: {
                                    test: /\.js/i,
                                    loader: 'babel-loader',
                                },
                            },
                        },
                    };

                    assert.isTrue(setupLoaders(configuration, pluginOptions));
                });
            });
        });

        describe('module.rules is an array', function () {
            describe('rule is a string', function () {
                it('should inject external-helpers to babel-loader', function () {
                    const configuration = {
                        module: {
                            rules: ['other-loader', 'babel-loader'],
                        },
                    };
                    setupLoaders(configuration, pluginOptions);

                    assert.sameMembers(
                        configuration.module.rules,
                        ['babel-loader?plugins[]=external-helpers', 'other-loader']
                    );
                })
            });

            describe('rule is an object', function () {
                it('should return true if modified some properties', function () {
                    const configuration = {
                        module: {
                            rules: [
                                {
                                    test: /\.js$/i,
                                    loader: 'babel-loader',
                                },
                                {
                                    test: /\.css$/i,
                                    loader: 'css-loader',
                                }
                            ],
                        },
                    };
                    assert.isTrue(setupLoaders(configuration, pluginOptions));
                });
            });
        });
    });

    describe('babel-loader is specified by alias', function () {
        it('should find babel-loader regarding alias and inject external-helpers query param', function () {
            const configuration = {
                entry: './main.js',
                module: {
                    rules: {
                        test: /\.js$/,
                        loader: 'babel-alias',
                    },
                },
                resolveLoader: {
                    alias: {
                        'babel-alias': 'babel-loader',
                    }
                },
            };
            const pluginOptions = {aliases: 'babel-alias'};

            assert.isTrue(setupLoaders(configuration, pluginOptions));
            assert.strictEqual(configuration.module.rules.loader, 'babel-alias?plugins[]=external-helpers');
        });
    });
});
