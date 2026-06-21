import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Minimal Vite scaffold so the single-file artifact can be previewed/built
// locally. The component itself is self-contained and also runs as-is when
// pasted into the Claude artifact environment.
export default defineConfig({
  plugins: [react()],
});
