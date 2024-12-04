const path = require('path');

module.exports = {
  entry: './public/engine/core/eng.ts', // Entry point of your application
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'engine.js',
    path: path.resolve(__dirname, 'public/build'),
    library: {
      type: 'module', // Change to 'module' for ES6 modules
    }
  },
  experiments: {
    outputModule: true, // Enable experimental support for ES6 modules
  },
  mode: 'development', // or 'production'
  devtool: 'source-map'
};