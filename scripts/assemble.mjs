// Assemble the single static deployment:
//   dist/         ← bodega-scroll (marketing site) at /
//   dist/portal/  ← bodega-portal Vite build at /portal/
// Run from the repo root AFTER `npm run build` inside bodega-portal/:
//   node scripts/assemble.mjs
import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const site = join(root, "bodega-scroll");
const portalDist = join(root, "bodega-portal", "dist");

if (!existsSync(portalDist)) {
  console.error("bodega-portal/dist not found — run `npm run build` in bodega-portal/ first.");
  process.exit(1);
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(site, dist, { recursive: true });
cpSync(portalDist, join(dist, "portal"), { recursive: true });
console.log("dist/ assembled: marketing at /, portal at /portal/");
