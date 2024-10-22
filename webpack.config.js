const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'util_bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'window',
  },
  mode: 'production',
};
