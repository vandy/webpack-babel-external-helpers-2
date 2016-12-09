'use strict';

const chai = require('chai');
const assert = chai.assert;
const defaultOptions = require('../src/plugin/defaults');
const PluginController = require('../src/plugin/options');

describe('OptionsController.', function () {
    describe('Default options.', function () {
        const compiler = {options: {}};

        beforeEach(function () {
            PluginController.init(compiler);
        });

        it('Should be defined', function () {
            Object.keys(defaultOptions.get()).every(key => assert.isDefined(PluginController.get(key)));
        });

        it('Should have the correct value types', function () {
            ['entries', 'aliases', 'whitelist'].forEach(key => {
                let value = PluginController.get(key);
                assert(Array.isArray(value) && value.length === 0, `Default "${key}" should be an empty array`);
            });
            assert.isFalse(PluginController.get('strict'), 'Default "strict" should be false');
        });

        it ('Non-default options should be undefined', function () {
            assert.isUndefined(PluginController.get('not-in-default'));
        });
    });

    describe('User options passed.', function () {
        it('Verified to be of the correct type before using', function () {
            const compiler = {options: {}};

            assert.throws(function () {
                PluginController.init(compiler, {entries: true});
            }, Error);

            assert.throws(function () {
                PluginController.init(compiler, {whitelist: 5});
            }, Error);

            assert.throws(function () {
                PluginController.init(compiler, {aliases: 'aliases'});
            }, Error);

            assert.doesNotThrow(function () {
                PluginController.init(compiler, {entries: 'main'});
            }, Error);

            assert.doesNotThrow(function () {
                PluginController.init(compiler, {entries: ['main', 'not-main']});
            }, Error);

            assert.doesNotThrow(function () {
                PluginController.init(compiler, {whitelist: 'one,two'});
            }, Error);

            assert.doesNotThrow(function () {
                PluginController.init(compiler, {whitelist: ['one', 'two']});
            }, Error);

            assert.doesNotThrow(function () {
                PluginController.init(compiler, {aliases: ['babel', 'babel-my-loader']});
            }, Error);
        });

        describe('Whitelist', function () {
            const compiler = {options: {}};

            it('Empty string results in an empty array', function () {
                PluginController.init(compiler, {whitelist: ''});
                let result = PluginController.get('whitelist');

                assert.isArray(result, 'empty string should result in whitelist array');
                assert.lengthOf(result, 0, 'empty string should result in empty whitelist array');
            });

            it('Space delimited string results in an array of trimmed items split by space', function () {
                PluginController.init(compiler, {whitelist: 'one  two three'});
                let result = PluginController.get('whitelist');

                assert.deepEqual(result, ['one', 'two', 'three'], 'all items should be trimmed without spaces inside');
            });

            it('Comma delimited string results in an array of items ' +
                'split by comma and without spaces outside and inside of the string', function () {
                PluginController.init(compiler, {whitelist: '  one, two,three without space,  four'});
                let result = PluginController.get('whitelist');

                assert.deepEqual(
                    result,
                    ['one', 'two', 'threewithoutspace', 'four'],
                    'all items should be split by comma, all spaces removed.');
            });

            it('Array results in an array with filtered out falsy values, other values are as is', function () {
                PluginController.init(compiler, {whitelist: ['one', '', 'two ', null, 'three with space']});
                let result = PluginController.get('whitelist');

                assert.deepEqual(
                    result,
                    ['one', 'two ', 'three with space'],
                    'falsy values should be filtered, non-falsy items left intact');
            });
        });

        describe('Entries', function () {
           it('Non-object "entry" property value of the configuration ' +
               'results in an empty array regardless of value "entries"', function () {
               const compiler = {options: {entry: './main.js'}};
               PluginController.init(compiler, {entries: 'main'});
               let result = PluginController.get('entries');

               assert.isArray(result);
               assert.lengthOf(result, 0);

               compiler.options.entry = ['./main.js', './content.js'];
               PluginController.init(compiler, {entries: ['background']});
               result = PluginController.get('entries');

               assert.isArray(result);
               assert.lengthOf(result, 0);
           });

           it('Object "entry" property value of the configuration ' +
               'results in an array containing passed value whether string or array with items intact', function () {
               const compiler = {options: {entry: {stable: './main.js'}}};
               PluginController.init(compiler, {entries: 'main'});
               let result = PluginController.get('entries');

               assert.deepEqual(result, ['main']);

               PluginController.init(compiler, {entries: ['stable', 'beta']});
               result = PluginController.get('entries');

               assert.deepEqual(result, ['stable', 'beta']);
           });
        });
    });
});
