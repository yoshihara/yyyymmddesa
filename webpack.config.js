const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    index: './src/js/index.js',
    options: './src/js/options.js',
    content: './src/js/content.js',
    background: './src/js/background.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
  // plugins: [
  //   new webpack.ProvidePlugin({
  //     jQuery: 'jquery'
  //   })
  // ]
};
