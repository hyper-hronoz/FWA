const { createWebpackConfig } = require("../../packages/webpack-config/createWebpackConfig");

const remoteMainUrl = process.env.REMOTE_MAIN_URL || "http://localhost:3004";
const remoteAdminUrl = process.env.REMOTE_ADMIN_URL || "http://localhost:3005";

module.exports = (_, argv) =>
  createWebpackConfig({
    appDir: __dirname,
    mode: argv.mode || "development",
    port: Number(process.env.PORT || 3003),
    publicDir: "static",
    federation: {
      name: "host",
      remotes: {
        mainRemote: `mainRemote@${remoteMainUrl}/remoteEntry.js`,
        adminRemote: `adminRemote@${remoteAdminUrl}/remoteEntry.js`
      }
    }
  });
