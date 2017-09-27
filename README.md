# webpack-babel-external-helpers-2
A Webpack plugin modifies webpack configuration to make `babel-loader` use [external-helpers](https://babeljs.io/docs/plugins/external-helpers/) and injects `babelHelpers` object to the specified bundles.


## Installation
`npm install webpack-babel-external-helpers-2`

## Motivation
A shortcut to configure `babel-loader` to use babel `external-helpers` plugin. There is no need to install the plugin manually, use complicated query-string syntax for `babel-loader` in webpack configuration and create external-helpers module (javascript code) to be added to webpack entries. Just install the package and make webpack use it as a plugin.

## Usage examples
```javascript
// webpack.config.js

const WebpackBabelExternalsPlugin = require('webpack-babel-external-helpers-2');

module.exports = {
    entry: './main.js',
    output: {
        filename: 'main.bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel?presets[]=es2015',
            }
        ],
    },
    plugins: [
        new WebpackBabelExternalsPlugin(/* plugin options object */),
    ],
};
```

## Options

#### `whitelist` `{Array<String>|String} : optional`
Keywords specifying helpers to be included in the output code according to the Babel specification. 

Array is used as is. Comma-separated string is split by comma, each item is trimmed. Space-separated string is split by space, all spaces are removed.

See [babel specification](https://babeljs.io/docs/plugins/external-helpers/).

#### `entries` `{Array<String>|String} : optional`
Entries (in terms of webpack) to be modified. The option is applied only when `entry` property of the webpack configuration is an object. Bundles of the specified entries will have additional module with the `babelHelpers` object injected. 

Array is used as is. String is used to specify only one entry.

See [webpack configuration](https://webpack.js.org/configuration/entry-context/).

#### `aliases` `{Array<String|RegExp>} : optional`
Array of aliases for `babel-loader` specified in the webpack configuration. 

In case of an alias is a string it's compared with a loader name with strict equality (both operands are lowercased).

#### `strict` `{Boolean=false} : optional`
The plugin throws if `strict === true` and no `babel-loader` was found in webpack configuration.

## Special notes

* Node v4 is supported. Use `lib/es5` as the entry point.

`require('webpack-babel-external-helpers-2/lib/es5')`

* The plugin doesn't work when the webpack configuration `entry` property is a function.
