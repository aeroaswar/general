// Assemble the combined Bodega deployment.
//
//   dist/
//     index.html      ← marketing landing  (served at /)
//     og.png          ← marketing OG image
//     portal/         ← client portal SPA   (served at /portal/, hash-routed)
//
// Run after `vite build` (which emits bodega-portal/dist). Vercel then ships
// `dist/` as the static output directory.
import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const portalBuild = resolve(root, "bodega-portal/dist");

if (!existsSync(portalBuild)) {
  console.error(`✗ Portal build not found at ${portalBuild}. Run the portal build first.`);
  process.exit(1);
}

// Start from a clean output dir so stale files never linger.
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// Marketing landing → site root.
cpSync(resolve(root, "index.html"), resolve(dist, "index.html"));
if (existsSync(resolve(root, "og.png"))) {
  cpSync(resolve(root, "og.png"), resolve(dist, "og.png"));
}

// Client portal → /portal.
cpSync(portalBuild, resolve(dist, "portal"), { recursive: true });

console.log("✓ Assembled dist/ — marketing at / , client portal at /portal/");
