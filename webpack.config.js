var path = require('path');
var webpack = require('webpack');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: './index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'inactivity-logout.js'
  },
  plugins: [
      new webpack.DefinePlugin({ON_DEV: process.env.NODE_ENV === 'dev'}),
      new webpack.DefinePlugin({ON_TEST: process.env.NODE_ENV === 'test'})
  ],
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
};