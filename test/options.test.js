'use strict';

const chai = require('chai');
const assert = chai.assert;
const optionsController = require('../src/plugin/options-controller');

describe('Plugin Options Controller', function () {
    describe('Default options', function () {
        it('should be defined', function () {
            ['entries', 'whitelist', 'aliases', 'strict'].every(name => assert.isDefined(optionsController.get(name)));
        });

        it('should have the correct value types', function () {
            ['entries', 'whitelist', 'aliases'].forEach(key => {
                const value = optionsController.get(key);
                assert(Array.isArray(value) && value.length === 0, `Default "${key}" should be an empty array`);
            });
            assert.isFalse(optionsController.get('strict'), 'Default "strict" should be false');
        });
    });

    it ('should be undefined non-default options', function () {
        assert.isUndefined(optionsController.get('not-in-default'));
    });

    describe('User options', function () {
        it('should be verified to have the correct type', function () {
            const compiler = {
                options: {},
                plugin() {},
            };

            assert.throws(function () {
                optionsController.run(compiler, {entries: true});
            }, Error);

            assert.throws(function () {
                optionsController.run(compiler, {whitelist: 5});
            }, Error);

            assert.throws(function () {
                optionsController.run(compiler, {aliases: 'aliases'});
            }, Error);

            assert.doesNotThrow(function () {
                optionsController.run(compiler, {entries: 'main'});
            }, Error);

            assert.doesNotThrow(function () {
                optionsController.run(compiler, {entries: ['main', 'not-main']});
            }, Error);

            assert.doesNotThrow(function () {
                optionsController.run(compiler, {whitelist: 'one,two'});
            }, Error);

            assert.doesNotThrow(function () {
                optionsController.run(compiler, {whitelist: ['one', 'two']});
            }, Error);

            assert.doesNotThrow(function () {
                optionsController.run(compiler, {aliases: ['babel', 'babel-my-loader']});
            }, Error);
        });

        describe('Whitelist', function () {
            const compiler = {
                options: {},
                plugin(name, callback) {
                    callback.call(this);
                },
            };

            it('empty string: should be an empty array', function () {
                optionsController.run(compiler, {whitelist: ''});
                const result = optionsController.get('whitelist');

                assert.isArray(result, 'empty string should result in whitelist array');
                assert.lengthOf(result, 0, 'empty string should result in empty whitelist array');
            });

            it('space delimited string: should be an array of trimmed items split by space', function () {
                optionsController.run(compiler, {whitelist: 'one  two three'});
                assert.deepEqual(
                    optionsController.get('whitelist'),
                    ['one', 'two', 'three'],
                    'all items should be trimmed without spaces inside'
                );
            });

            it('comma delimited string: should be an array of items split by comma with no spaces', function () {
                optionsController.run(compiler, {whitelist: '  one, two,three without space,  four'});
                assert.deepEqual(
                    optionsController.get('whitelist'),
                    ['one', 'two', 'threewithoutspace', 'four'],
                    'all items should be split by comma, all spaces removed.');
            });

            it('array: should be an array with filtered out falsy values, other values are as is', function () {
                optionsController.run(compiler, {whitelist: ['one', '', 'two ', null, 'three with space']});
                assert.deepEqual(
                    optionsController.get('whitelist'),
                    ['one', 'two ', 'three with space'],
                    'falsy values should be filtered, non-falsy items left intact');
            });
        });

        describe('Entries', function () {
            const compiler = {
                options: {},
                plugin(name, callback) {
                    callback.call(this);
                },
            };

           afterEach(function () {
               compiler.options = {};
           });

           it('should be an empty array if Webpack configuration "entry" property is not an object', function () {
               compiler.options.entry = './main.js';

               optionsController.run(compiler, {entries: 'main'});
               let result = optionsController.get('entries');

               assert.isArray(result);
               assert.lengthOf(result, 0);

               compiler.options.entry = ['./main.js', './content.js'];
               optionsController.run(compiler, {entries: ['background']});
               result = optionsController.get('entries');

               assert.isArray(result);
               assert.lengthOf(result, 0);
           });

           it('should be an array containing passed value (whether string or array) ' +
               'if Webpack configuration "entry" property is an object', function () {
               compiler.options.entry = {stable: './main.js'};

               optionsController.run(compiler, {entries: 'main'});
               let result = optionsController.get('entries');

               assert.deepEqual(result, ['main']);

               optionsController.run(compiler, {entries: ['stable', 'beta']});
               result = optionsController.get('entries');

               assert.deepEqual(result, ['stable', 'beta']);
           });
        });
    });
});
