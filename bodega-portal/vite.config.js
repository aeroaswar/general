import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Bodega client portal — static SPA build, served under /portal/ on the
// combined Bodega site (marketing landing at /, this portal at /portal/).
export default defineConfig({
  base: "/portal/",
  plugins: [react()],
  build: { target: "es2020", outDir: "dist", chunkSizeWarningLimit: 1400 },
});
