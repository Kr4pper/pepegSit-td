const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/web/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            net: false
        }
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new NodePolyfillPlugin(),
    ]
};
