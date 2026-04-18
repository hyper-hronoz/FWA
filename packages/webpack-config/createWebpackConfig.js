const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { container } = require("webpack");

const { ModuleFederationPlugin } = container;

const rootDir = path.resolve(__dirname, "../..");

const sharedDeps = {
  react: { singleton: true, requiredVersion: false },
  "react-dom": { singleton: true, requiredVersion: false },
  "react-router-dom": { singleton: true, requiredVersion: false }
};

const createWebpackConfig = ({
  appDir,
  mode,
  port,
  federation,
  publicDir,
  define = {}
}) => {
  const isProd = mode === "production";

  return {
    context: appDir,
    mode,
    entry: path.resolve(appDir, "src/index.ts"),
    output: {
      path: path.resolve(appDir, "dist"),
      publicPath: "auto",
      clean: true
    },
    devtool: isProd ? "source-map" : "eval-cheap-module-source-map",
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
      alias: {
        "@shared": path.resolve(rootDir, "shared"),
        "@shared-ui": path.resolve(rootDir, "packages/shared-ui/src")
      }
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          include: [
            path.resolve(rootDir, "apps"),
            path.resolve(rootDir, "packages/shared-ui/src"),
            path.resolve(rootDir, "shared")
          ],
          use: {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            }
          }
        },
        {
          test: /\.css$/i,
          use: [
            isProd ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader"
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg|mp4|webm)$/i,
          type: "asset/resource"
        }
      ]
    },
    plugins: [
      new ModuleFederationPlugin({
        ...federation,
        shared: {
          ...sharedDeps,
          ...(federation.shared || {})
        }
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(appDir, "index.html")
      }),
      ...(publicDir
        ? [
            new CopyWebpackPlugin({
              patterns: [
                {
                  from: path.resolve(appDir, publicDir),
                  to: path.resolve(appDir, "dist")
                }
              ]
            })
          ]
        : []),
      ...(isProd ? [new MiniCssExtractPlugin()] : [])
    ],
    devServer: {
      port,
      historyApiFallback: true,
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      static: {
        directory: path.resolve(appDir, "dist")
      }
    },
    performance: false,
    optimization: {
      runtimeChunk: false
    }
  };
};

module.exports = {
  createWebpackConfig,
  rootDir
};
