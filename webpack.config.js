const path = require('path');
const fs = require('fs');
// const webpack = require('webpack');
const fm = require('front-matter');
const marked = require('marked');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const moment = require('moment');

const IS_PROD = process.env.NODE_ENV === 'production';

// POST GENERATION SECTION
const posts = fs.readdirSync('./posts/');
const postsData = posts
  .map(post => ({
    ...fm(fs.readFileSync(`./posts/${post}`, 'utf8')),
    filename: post.split('.')[0],
    template: 'post',
    lang: 'en',
  }))
  .map(post => ({
    ...post,
    content: marked(post.body),
    short: marked(post.body.split('\n', 3).join('\n')),
  }))
  .sort((a, b) => {
    const dateA = moment(a.attributes.date, 'D-M-Y');
    const dateB = moment(b.attributes.date, 'D-M-Y');

    return dateA.diff(dateB);
  });

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
        postsData,
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'token/index.html',
      template: 'src/index.ejs',
      templateParameters: {
        lang: 'en',
        template: 'token',
        postsData,
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'solutions/index.html',
      template: 'src/index.ejs',
      templateParameters: {
        lang: 'en',
        template: 'solutions',
        postsData,
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'posts/index.html',
      template: 'src/posts.ejs',
      templateParameters: {
        lang: 'en',
        template: 'posts',
        postsData,
      },
    }),
    ...postsData.map(post => new HtmlWebpackPlugin({
      filename: `posts/${post.filename}/index.html`,
      template: 'src/post.ejs',
      templateParameters: post,
    })),
  ],
};

if (IS_PROD) {
  config.plugins.push(
    new ExtractTextPlugin('bundle.css'),
  );
}

module.exports = config;
