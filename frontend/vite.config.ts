import { fileURLToPath, URL } from "node:url"
import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  publicDir: "static",
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
      "@state/hooks": fileURLToPath(new URL("./src/state/runtime/local.tsx", import.meta.url)),
    },
  },
})
