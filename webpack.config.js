const path = require('path');

module.exports = {
  mode: 'production', // NOTE: developmentだとoptions.htmlでのJS読み込みがCSPに引っかかってevalに失敗するのでproduction
  entry: {
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
      },
      {
        test: /\.sass$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ]
      }
    ]
  }
};
