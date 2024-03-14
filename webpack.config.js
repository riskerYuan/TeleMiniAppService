const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
module.exports = {
  // 入口点，这里假设你的前端入口文件是 src/client/index.js
  entry: path.resolve(__dirname, 'index.js'),
  // 输出配置，这里假设你希望将打包后的文件输出到 public/dist 目录
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  // 模块加载器配置
  module: {
    rules: [
      {
        // 使用 babel-loader 转译 JavaScript 文件
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        // 使用 style-loader 和 css-loader 处理 CSS 文件
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        // 使用 file-loader 处理图片等静态资源
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
            },
          },
        ],
      },
      // 您可以根据需要添加更多规则来处理其他类型的文件
    ],
  },
  // 插件配置，例如提供环境变量等
  plugins: [
    // ... 其他插件
    new NodePolyfillPlugin(),
  ],
  // 开发工具配置，生产环境通常不需要 source maps
  devtool: 'source-map',
  // 其他配置...
};