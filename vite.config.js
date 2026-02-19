import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/src/dist/" : "/",
  plugins: [react()],
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    cors: {
      origin: ["http://localhost:12500", "http://127.0.0.1:12500"],
      credentials: true,
    },
    port: 5174,
    allowedHosts: ["localhost"],
    hmr: {
      clientPort: 5174,
    },
  },
  build: {
    outDir: "src/dist",
    manifest: true,
    rollupOptions: {
      input: {
        global: resolve(__dirname, "src/static/css/global.css"),
        main: resolve(__dirname, "src/static/js/main.js"),
      },
    },
  },
}));
