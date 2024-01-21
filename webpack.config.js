const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    entry: "./src/app.tsx",
    output: {
        filename: "bundle.[contenthash].js",
        path: path.resolve(__dirname, "dist"),
    },
    resolve: {
        extensions: [".ts", ".js", ".tsx"], // Include .tsx in extensions
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/, // Include .tsx files
                use: "ts-loader",
                include: path.resolve(__dirname, "src"),
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./html/index.html",
            minify: true,
        }),
        new WebpackManifestPlugin(),
        new CleanWebpackPlugin(),
    ],
};
