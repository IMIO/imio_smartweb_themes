const path = require("path");

//const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const FileManagerPlugin = require('filemanager-webpack-plugin');

const BASE_PATH = path.resolve(__dirname, ".")

module.exports = (env, argv) => {
    const mode = argv.mode ? argv.mode : "development";
    const THEME_FOLDER = env.theme ? env.theme : "base";
    const THEME_PATH = `${BASE_PATH}/${THEME_FOLDER}`;
    const BUNDLE_NAME = `++theme++${THEME_FOLDER}`;

    return {
        mode: mode,
        entry: [path.resolve(THEME_PATH, "./src/index.js")],
        output: {
            path: path.resolve(THEME_PATH, "./dist"),
            filename: "js/theme.js"
        },
        plugins: [
            new FileManagerPlugin({
                events: {
                    onStart: {
                      delete: [`${THEME_PATH}/dist`]
                    },
                    onEnd: {
                        archive: [
                            env.zip && {
                                source: `${THEME_PATH}`,
                                destination: `${THEME_PATH}/theme.zip`,
                                options: {
                                    globOptions: {
                                        ignore: [
                                            'node_modules/**',
                                            'src/**',
                                            'package.json'
                                        ]
                                    }
                                }
                            }
                        ].filter(Boolean)
                    }
                }
            }),
            new MiniCssExtractPlugin({
                filename: "css/theme.css",
            }),
        ].filter(Boolean),
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/i,
                    loader: 'babel-loader'
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // In production, creates CSS files
                        // In development serve CSS through JS 'with style-loader'
                        {
                            loader:
                                mode === "development"
                                    ? "style-loader"
                                    : MiniCssExtractPlugin.loader,
                        },
                        // Translates CSS into CommonJS
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: mode === "development",
                            },
                        },
                        // Use postcss to add vendor prefixes and various transforms to the css
                        {
                            loader: "postcss-loader",
                            options: {
                                sourceMap: mode === "development",
                            },
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: mode === "development",
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/i,
                    use: [
                        // In production, creates CSS files
                        // In development serve CSS through JS 'with style-loader'
                        {
                            loader:
                                mode === "development"
                                    ? "style-loader"
                                    : MiniCssExtractPlugin.loader,
                        },
                        // Translates CSS into CommonJS
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: mode === "development",
                            },
                        },
                    ],
                },
                {
                    // Use @svgr/webpack to import svg directly in .js files
                    test: /\.svg$/i,
                    issuer: /\.(js|mjs|jsx|ts|tsx)$/,
                    loader: "@svgr/webpack",
                },
                {
                    // Use file-loader to import img files in other files
                    test: /\.(png|jpg|gif|jpeg|svg)$/i,
                    loader: "file-loader",
                    options: {
                        name: "[name].[hash].[ext]",
                        outputPath: "assets",
                    },
                },
                {
                    test: /\.(eot|woff|woff2|ttf)([?]?.*)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "assets/fonts",
                    },
                },
            ],
        },
        optimization: {
            usedExports: true,
            minimizer: [
                new CssMinimizerPlugin(),
                new TerserPlugin({
                    parallel: true,
                }),
            ],
        },
        devServer: {
            port: 3000,
            hot: true,
            static: {
                directory: THEME_PATH
            },
            // Proxy everything to the Plone Backend EXCEPT our bundle as
            // Webpack Dev Server will serve it.
            proxy: [
                {
                    context: ["/**"],
                    target: "http://localhost:8080",
                    bypass: function (req, res, proxyOptions) {
                        let path = req.url
                        if (!path.includes(BUNDLE_NAME)) {
                            return // bypass to backend
                        }
                        if (path.includes("++unique++")) {
                            // Strip ++unique++ part
                            const reg = /\/\+\+unique\+\+[^/]+/;
                            path = path.replace(reg, "");
                        }
                        path = path.split(BUNDLE_NAME)[1]; // Keep only the path after our bundle name
                        return path;
                    },
                }
            ],
        },
    };
};
