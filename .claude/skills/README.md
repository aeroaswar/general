# Project skills

Skills in this folder are **auto-discovered** by Claude Code for anyone who opens
or clones this repo — no install step. Each skill is a folder containing a
`SKILL.md`. Claude reads each skill's `description` and invokes the skill when a
task matches.

```
.claude/skills/
├── README.md
├── _template/
│   └── SKILL.md        # copy this to start a new skill
└── <your-skill>/
    └── SKILL.md
```

## Adding a skill you authored locally

Your personal skills live in `~/.claude/skills/` on your machine. Copy each one
in and commit it:

```sh
cp -R ~/.claude/skills/<skill-name> .claude/skills/
git add .claude/skills/<skill-name>
git commit -m "Add <skill-name> skill"
git push
```

That's all — the next time anyone uses Claude Code in this repo, the skill is
available.

## Adding a skill from a public GitHub repo

This repo also tracks GitHub-sourced skills in `../../skills-lock.json` via the
[`npx skills`](https://github.com/vercel-labs/skills) CLI:

```sh
npx skills add owner/repo --list          # browse what's available
npx skills add owner/repo --skill <name>  # installs into .claude/skills + updates lockfile
```

Commit both the new `.claude/skills/...` folder **and** the updated
`skills-lock.json`. (Committing the actual folder is what makes it portable —
lockfile-only restore is still experimental.)

## SKILL.md format

Minimal — only `description` is required in the frontmatter:

```yaml
---
name: my-skill            # optional, defaults to folder name
description: One sentence on what it does and when to use it.
---

Instructions for Claude go here, in plain markdown.
```

Optional frontmatter fields: `disable-model-invocation: true` (user-only,
invoked as `/my-skill`), `allowed-tools`, `when_to_use`. Supporting files
(scripts, reference docs) can live alongside `SKILL.md` and be referenced from
it by relative path.
