const path = require('path');

module.exports = {
  target: 'webworker',
  mode: 'production',
  entry: './index.js',
  output: {
    filename: 'worker.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: true,
  },
};