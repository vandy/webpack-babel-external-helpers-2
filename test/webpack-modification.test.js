'use strict';

const chai = require('chai');
const assert = chai.assert;
const PluginController = require('../src/plugin/options');
const webpackModification = require('../src/webpack-modification');

describe('Babel-loader is not specified in configuration.', function () {
    it('Throws error according to the "strict" option', function () {
        const compiler = {
            options: {
                entry: './main.js',
                module: {
                    loaders: [{test: /\.js$/, loader: 'some-loader'}],
                },
            }
        };
        PluginController.init(compiler, {strict: true});

        assert.throws(function () {
            webpackModification.modifyConfiguration(compiler);
        }, Error);

        PluginController.init(compiler, {strict: false});

        assert.doesNotThrow(function () {
            webpackModification.modifyConfiguration(compiler);
        }, Error);
    });
});
