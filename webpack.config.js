const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    options: './src/js/options.js',
    content: './src/js/content.js'
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
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      }
    ]
  }
  // plugins: [
  //   new webpack.ProvidePlugin({
  //     jQuery: 'jquery'
  //   })
  // ]
};
