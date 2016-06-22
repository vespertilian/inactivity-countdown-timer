var path = require('path');
var webpack = require('webpack');

var config = {
  context: path.resolve(__dirname, 'src'),
  entry: {demo: './demo.ts'},
  output: {
    path: path.resolve(__dirname, 'src'),
    filename: '[name].js'
  },
  plugins: [
      new webpack.DefinePlugin({ON_DEV: process.env.NODE_ENV === 'dev'}),
      new webpack.DefinePlugin({ON_TEST: process.env.NODE_ENV === 'test'})
  ],
  resolve: {
    extensions: ['', '.webpack.js', '.ts', '.js']
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader', exclude: /node_modules/}
    ]
  }
};

if(process.env.NODE_ENV === 'distribution'){
  console.log('building dist');
  config.entry = { app:'./main.ts' };
  config.output = {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    // export itself to a global umd
    library: ['InactivityLogout'],
    libraryTarget: 'umd'
  };
  config.ts  = {
    compilerOptions: {
      module: "commonjs",
      target: "es5",
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      declaration: true,
      sourceMap: true,
      noImplicitAny: true
    }
  }
}

module.exports = config;
