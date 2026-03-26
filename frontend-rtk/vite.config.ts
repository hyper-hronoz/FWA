import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  publicDir: "../frontend/static",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
      "@state/hooks": fileURLToPath(new URL("./src/state/hooks.tsx", import.meta.url)),
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
});
