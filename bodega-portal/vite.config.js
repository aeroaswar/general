import { defineConfig } from "vite";

// Bodega portal — static single-page build, deployable to Vercel/Netlify/any host.
export default defineConfig({
  base: "./",
  build: {
    target: "es2020",
    outDir: "dist",
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1200,
  },
});
