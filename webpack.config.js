const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
  entry: './src/app.ts',
  output: {
    filename: 'bundle.[contenthash].js', // Implementing cache busting
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './html/index.html', // Adjust the path to your HTML file
      minify: true, // You can customize minification options here
    }),
    new WebpackManifestPlugin(),
    new CleanWebpackPlugin(),
  ]
};
