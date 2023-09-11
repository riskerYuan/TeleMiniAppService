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
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'] // 这个预设会根据你的目标环境，自动决定应用哪些转换/插件
          }
        }
      }
    ]
  }
};