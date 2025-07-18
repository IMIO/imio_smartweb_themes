const path = require("path");
const WebpackBar = require("webpackbar");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const fs = require("fs");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const BASE_PATH = path.resolve(__dirname, ".");

module.exports = (env, argv) => {
  const mode = argv.mode ? argv.mode : "development";
  const THEME_FOLDER = env.theme ? env.theme : "base";
  const THEME_PATH = `${BASE_PATH}/${THEME_FOLDER}`;
  const BUNDLE_NAME = `++theme++${THEME_FOLDER}`;

  return {
    mode: mode,
    entry: [path.resolve(THEME_PATH, "./src/index.js")],
    output: {
      path: THEME_PATH,
      filename: "dist/js/theme.js",
    },
    resolve: {
      alias: {
        "@theme": THEME_PATH,
      },
    },
    plugins: [
      new FileManagerPlugin({
        events: {
          onStart: {
            delete: [`${THEME_PATH}/dist`],
          },
          onEnd: [
            {
              mkdir: [`${THEME_PATH}/tmp`, `${THEME_PATH}/tmp/${THEME_FOLDER}`],
            },
            {
              copy: [
                {
                  source: `${THEME_PATH}/**`,
                  destination: `${THEME_PATH}/tmp/${THEME_FOLDER}`,
                  options: {
                    flat: false,
                    preserveTimestamps: true,
                    overwite: true,
                  },
                  globOptions: {
                    ignore: [
                      "**/package.json",
                      "**/*.zip",
                      "**/src",
                      "**/node_modules",
                    ],
                  },
                },
                {
                  source: `${THEME_PATH}/dist`,
                  destination: `${THEME_PATH}/tmp/${THEME_FOLDER}/dist`,
                },
              ],
            },
            {
              archive: [
                {
                  source: `${THEME_PATH}/tmp`,
                  destination: `${THEME_PATH}/theme.zip`,
                },
              ],
            },
            { delete: [`${THEME_PATH}/tmp`] },
          ],
        },
      }),
      new MiniCssExtractPlugin({
        filename: "dist/css/theme.css",
      }),
      new WebpackBar(),
      //   new HtmlWebpackPlugin({
      //     template: THEME_PATH + '/index.html',
      //     filename: 'index.html',
      // }),
      ...(fs.existsSync(THEME_PATH + "/icons/logo.png")
        ? [
            new FaviconsWebpackPlugin({
              logo: THEME_PATH + "/icons/logo.png",
              mode: "webapp",
              cache: false,
              outputPath: THEME_PATH + "/icons",
              inject: false,
              favicons: {
                appName: null,
                appShortName: null,
                appDescription: null,
                developerName: null,
                developerURL: null,
                loadManifestWithCredentials: false,
                icons: {
                  android: true,
                  appleIcon: true,
                  appleStartup: false,
                  favicons: true,
                  windows: false,
                  yandex: false,
                },
              },
            }),
          ]
        : []),
    ].filter(Boolean),
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/i,
          loader: "babel-loader",
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
                implementation: require("sass-embedded"),
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
          test: /\.(png|jpg|gif|jpeg|svg|webp)$/i,
          type: "asset/resource",
          generator: {
            filename: "dist/images/[name][hash:8].[ext]",
          },
        },
        {
          test: /\.(eot|woff|woff2|ttf)([?]?.*)$/,
          type: "asset/resource",
          generator: {
            filename: "dist/fonts/[name].[ext]",
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
      allowedHosts: "all",
      liveReload: false, // Mandatory as we use hot module replacements (see `hot` above)
      static: {
        directory: THEME_PATH,
      },
      client: {
        overlay: false,
      },
      devMiddleware: {
        // This is necessary as Plone use `<script integrity=` and if we don't store the file on disk,
        // Plone has no way to recompute the hash and thus the file is not executed in the browser.
        // We filter out 'hot-update' files as we don't need them to be written on disk.
        writeToDisk: (filePath) => {
          return !/hot-update/.test(filePath);
        },
      },
      // Proxy everything to the Plone Backend EXCEPT our bundle as
      // Webpack Dev Server will serve it.
      proxy: [
        {
          context: ["/**"],
          target: "http://localhost:8080",
          bypass: function (req, res, proxyOptions) {
            let path = req.url;
            if (path.includes(BUNDLE_NAME)) {
              path = path.split(BUNDLE_NAME)[1]; // Keep only the path after our bundle name
              return path;
            }
            return null;
          },
        },
      ],
    },
  };
};
