# general

> **▶ Live WebGL experience:** [`index.html`](./index.html) — *Composites: Architecture of
> New Possibilities*, a scroll-driven Three.js + GSAP + Lenis architectural showcase
> (homage to [composites.archi](https://www.composites.archi)). Run `python3 -m http.server`
> and open it; full docs + DevTools verification protocol in
> [`COMPOSITES-EXPERIENCE.md`](./COMPOSITES-EXPERIENCE.md).

Imported content from the Google Drive **`AI`** workspace, excluding all
MMI/IJBA material.

## Status
This import was constrained by a hard technical limit: Drive files can only be
fetched through a tool that returns each file as base64 **into the model's
context**, so large binaries and big files cannot be reliably transferred this
way. As a result:

- **Imported directly (verified):** `CLAUDE.md`, `cinematic-3d-master-prompt.md`,
  `skills-lock.json`, `.vercelignore`.
- **Everything else** is indexed in [`MANIFEST.md`](./MANIFEST.md) with direct
  Drive links (MMI/IJBA excluded), so it can be pulled manually or with a direct
  sync tool such as [`rclone`](https://rclone.org/drive/).

## Recommended way to pull the rest
The reliable path for the full tree (especially binaries and large web projects)
is a direct Drive sync that doesn't route bytes through a model, e.g.:

```sh
rclone copy "gdrive:AI" ./ \
  --exclude "/mmi/**" --exclude "/ptmmi-nickel/**" \
  --exclude "/billion-dollar-board/**" \
  --exclude "**/ijba/**" --exclude "**/mmi/**" \
  --exclude "mmi-*.html" --exclude "*ijba*" --exclude "*mmi*"
```

See `MANIFEST.md` for the per-folder Drive links.
