var path = require('path');

var config = {
  mode: 'development',
  context: path.resolve(__dirname, 'src'),
  entry: {demo: './demo.ts'},
  output: {
    path: path.resolve(__dirname, 'dev'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader', exclude: /node_modules/}
    ]
  },
  devtool: 'source-map',
  devServer: {
    contentBase: "./src"
  }
};

if(process.env.NODE_ENV === 'distribution'){
  console.log('building dist');
  config.mode = 'production';
  config.entry = { app:'./main.ts' };
  config.devtool = 'source-map';
  config.output = {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    // export itself to a global umd
    library: ['InactivityLogout'],
    libraryTarget: 'umd'
  };
  config.module = {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.prod.json'
        }
      }
    ]
  };
}

module.exports = config;
