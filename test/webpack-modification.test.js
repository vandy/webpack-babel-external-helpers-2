'use strict';

const chai = require('chai');
const assert = chai.assert;
const optionsController = require('../src/plugin/options-controller');
const webpackModification = require('../src/webpack-modification');

describe('Webpack modification', function () {
    const compiler = {
        options: {
            entry: './main.js',
            module: {
                rules: [{test: /\.js$/, loader: 'some-loader'}],
            },
        },
        plugin(name, callback) {
            callback.call(this);
        },
    };

    it('should throw an error in strict mode ("strict" option is true) ' +
        'if no babel-loader in webpack configuration', function () {
        optionsController.run(compiler, {strict: true});

        assert.throws(function () {
            webpackModification.run(compiler);
        }, Error);
    });

    it('should not throw an error not in strict mode ("strict" option is false) ' +
        'if no babel-loader in webpack configuration', function () {
        optionsController.run(compiler, {strict: false});

        assert.doesNotThrow(function () {
            webpackModification.run(compiler);
        }, Error);
    });

    it('should throw if webpack configuration "entry" property is a function', function () {
        compiler.options.entry = function () {};
        assert.throws(function () {
            webpackModification.run(compiler);
        }, Error);
    });
});
