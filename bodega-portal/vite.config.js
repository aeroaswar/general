import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Deploys as a static SPA under /portal/ (marketing site owns /).
export default defineConfig({
  base: "/portal/",
  plugins: [react()],
});
