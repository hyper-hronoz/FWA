const { createWebpackConfig } = require("../../packages/webpack-config/createWebpackConfig");

module.exports = (_, argv) =>
  createWebpackConfig({
    appDir: __dirname,
    mode: argv.mode || "development",
    port: Number(process.env.PORT || 3004),
    federation: {
      name: "mainRemote",
      filename: "remoteEntry.js",
      exposes: {
        "./AppRoutes": "./src/exposes/AppRoutes"
      }
    }
  });
