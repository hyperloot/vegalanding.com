const path = require('path');
const fs = require('fs');
// const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const IS_PROD = process.env.NODE_ENV === 'production';

// CONFIG
const config = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    filename: 'build.js',
  },
  module: {
    rules: [
      {
        enforce: 'post',
        test: /\.css$/,
        loader: IS_PROD ? ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }) : 'style-loader!css-loader?sourceMap',
      }, {
        enforce: 'pre',
        test: /\.(js)$/,
        loader: 'eslint-loader',
        options: {
          emitWarning: true,
          failOnError: false,
          failOnWarning: false,
        },
        exclude: /node_modules/,
      }, {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      }, {
        test: /\.(png|jpg|gif|otf|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      }, {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader',
          options: {
            interpolate: true,
          },
        },
      },
    ],
  },
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['*', '.js', '.json'],
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
  },
  performance: {
    hints: false,
  },
  devtool: '#eval-source-map',
  plugins: [
    new CopyWebpackPlugin([{ from: 'public' }]),
    new FaviconsWebpackPlugin('./src/assets/logo.svg'),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.ejs',
      templateParameters: {
        lang: 'en',
        template: 'about',
      },
    }),
  ],
};

if (IS_PROD) {
  config.plugins.push(
    new ExtractTextPlugin('bundle.css'),
  );
}

module.exports = config;