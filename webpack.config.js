const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const babelLoader = require("babel-loader");

module.exports = {
    entry: [
        "babel-polyfill","./src/js/app.js"
    ],
    output: {
        path: path.resolve(__dirname, "dist/js"),
        filename: "bundle.js",
    },
    devServer: {
        contentBase: "./dist"
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            filename:"index.html",
            template:"./src/index.html"
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader
                },
                {
                    loader: "css-loader",
                    options: {
                        sourceMap: true,
                        modules: true,
                        localIdentName: "[local]"
                    }
                },
                    "sass-loader"
                ]
            }

        ]
    }
}
