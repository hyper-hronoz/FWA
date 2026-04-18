const { createWebpackConfig } = require("../../packages/webpack-config/createWebpackConfig");

module.exports = (_, argv) =>
  createWebpackConfig({
    appDir: __dirname,
    mode: argv.mode || "development",
    port: Number(process.env.PORT || 3005),
    federation: {
      name: "adminRemote",
      filename: "remoteEntry.js",
      exposes: {
        "./AppRoutes": "./src/exposes/AppRoutes"
      }
    }
  });
