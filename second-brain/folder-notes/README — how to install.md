# Folder notes — install instructions

These are **Obsidian folder notes**: one `<folder>/<folder>.md` per major project
folder in your **AI** vault. Each links up to its Area hub + [[Vault Map]], so the
raw code/asset folders finally connect to the knowledge graph.

## Safe install (non-destructive merge)

Unzip, then **merge** into your AI vault — do NOT drag-replace (macOS would
overwrite whole folders). Use `rsync` so existing files are untouched and only the
new `.md` folder notes are added:

```sh
rsync -av --ignore-existing folder-notes/ "/path/to/iCloud/.../AI/"
```

- `--ignore-existing` = never touch a file you already have.
- Drop the flag only if you want to refresh the folder notes themselves.

## Notes
- Folder names here must exactly match your real folder names. If you renamed any
  (e.g. `IJBA & Federation`), adjust before syncing or just move that one `.md` in.
- Requires the **Folder notes** community plugin (or Obsidian 1.x core folder-note
  behavior) to show the note when you click the folder. Without it they're still
  normal notes that link correctly in the graph.
- After syncing, open Graph view → Settings → Attachments **off**, Existing files
  **on** to see the cleaned-up knowledge graph.
