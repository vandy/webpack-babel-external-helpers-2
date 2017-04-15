# webpack-babel-external-helpers-2
A Webpack plugin which automatically configures `babel-loader` to use [external-helpers](https://babeljs.io/docs/plugins/external-helpers/). And injects `babelHelpers` object to each bundle specified in the configuration.

## Installation
`npm install webpack-babel-external-helpers-2`

## Motivation
A shortcut to configure babel-loader to use babel-external-helpers plugin. There is no need to install babel plugin manually, use complicated query-string syntax on babel-loader to specify its parameters and create external-helpers module (javascript code) to be added to webpack entries. Just install the package, and make webpack use it as a plugin.

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
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel?presets[]=es2015',
            }
        ],
    },
    plugins: [
        new WebpackBabelExternalsPlugin(),
    ],
};
```

## Options

#### `whitelist` `{Array<String>|String} : optional`
A list of keywords specifying helpers to be inlcuded in the output code according to the Babel specification. 
In case of array it's used as is. Comma-separated string is split by comma, each item is trimmed. Space-separated string is split by space, all spaces are removed.

#### `entries` `{Array<String>|String} : optional`
A list of entries (in terms of webpack) to be modified, in case of `entry` property is an object in a webpack configuration. Only specified bundles will have `babelHelpers` object injected. 

See [webpack configuration](https://webpack.github.io/docs/configuration.html#entry).

#### `aliases` `{Array<String|RegExp>} : optional`
Array of aliases for babel-loader specified in configuration. In case of an alias is a string it's compared with a loader name with strict equality (both operands are lowercased).

#### `strict` `{Boolean=false} : optional`
The plugin throws if `strict === true` and no babel-loader was found in webpack configuration.

## Special notes

Node v4 is supported. Use `lib/es5` as the entry point.

`require('webpack-babel-external-helpers-2/lib/es5')`
