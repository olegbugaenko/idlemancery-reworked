const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require("webpack");

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js$|\.jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ['@babel/plugin-proposal-logical-assignment-operators']
                    },
                },
            },
            {
                test: /\.worker\.js$/,
                use: {
                    loader: 'worker-loader',
                    options: { esModule: true },
                },
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name][ext][query]'
                }
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: '.' } // Копіюємо вміст папки 'public' до кореня 'dist'
            ],
        }),
        new webpack.DefinePlugin({
            'IS_DEMO': JSON.stringify(process.env.IS_DEMO || '0'),
            'IS_STEAM_BUILD': JSON.stringify(process.env.IS_STEAM_BUILD || '0'),
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
        hot: true,
    },
    resolve: {
        fallback: {
            "fs": false,
            "path": false,
            "os": false,
        },
    },
};
