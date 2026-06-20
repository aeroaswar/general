import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Bodega client portal — static SPA build, deployable to any host.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { target: "es2020", outDir: "dist", chunkSizeWarningLimit: 1400 },
});
