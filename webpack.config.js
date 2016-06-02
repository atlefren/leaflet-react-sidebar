'use strict';
var path = require('path');
var webpack = require('webpack');


module.exports = {
    entry: {
        sidebar: './src/sidebar.jsx'
    },
    output: {
        path: path.join(__dirname, 'bundles'),
        filename: '[name].bundle.js'
    },
     resolve: {
        extensions: ['', '.js', '.jsx', '.json', '.scss', '.css'],
        alias: {
            leaflet_css: __dirname + '/node_modules/leaflet/dist/leaflet.css'
        }
    },
    module: {
        loaders: [
            {test: /\.css$/, loader: 'style-loader!css-loader'},
            {test: /\.(png|jpg)$/, loader: 'file-loader?name=images/[name].[ext]'},
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
};
