const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
    entry: "./bootstrap.js",
    output: {
        publicPath: '/dist/',
        path: path.resolve(__dirname, "dist"),
        filename: "bootstrap.js",
    },
    mode: "development",
    devServer: {
        static: './'
    },
    experiments: {
        syncWebAssembly: true,
        topLevelAwait: true
    },
    plugins: [
        new FilterWarningsPlugin({
            exclude: [/Critical dependency/]
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "./index.html", to: "./index.html" },
            ],
        })
    ]
};