# Headroom plugin hooks (opt-in)

This wires up the [Headroom](https://github.com/headroomlabs-ai/headroom) plugin
(`headroomlabs-ai/headroom` → `plugins/headroom-agent-hooks`) as a project hook.

Normally you'd install it with `/plugin marketplace add headroomlabs-ai/headroom`,
but in the Claude Code web environment the `git clone` that command performs is
blocked by the egress policy. So the plugin's behaviour is reproduced here with a
committed hook script instead.

## What it does

The upstream plugin ships a single `hooks.json` whose only action is to run
`headroom init hook ensure` — a best-effort helper that brings up any durable
Headroom runtime, and no-ops when none is deployed. It runs on two events:

| Event        | Matcher           | Command                                  |
|--------------|-------------------|------------------------------------------|
| SessionStart | `startup\|resume` | `headroom-ensure.sh install` (installs the CLI if missing, then `ensure`) |
| PreToolUse   | `Bash\|PowerShell`| `headroom-ensure.sh` (`ensure` only, if the CLI is present) |

`headroom` is the CLI from the `headroom-ai` PyPI package. The `install` mode runs
`pip install headroom-ai` on first session start (this container is ephemeral, so
that happens once per web session). `headroom-ensure.sh` is idempotent, silent,
and always exits 0, so it can never block a tool call or fail a session start.

## This is NOT active yet

Claude Code only reads `.claude/settings.json` (and `settings.local.json`). The
config lives in **`settings.headroom.example.json`**, which Claude Code ignores.
Nothing runs until you opt in.

## Activate

Merge the `hooks` block from `settings.headroom.example.json` into
`.claude/settings.json` (create that file if it doesn't exist). For a personal,
un-committed activation use `.claude/settings.local.json` instead.

> Heads up: activating means the `PreToolUse` hook runs `headroom init hook ensure`
> **before every Bash/PowerShell call**, and the `SessionStart` hook will
> `pip install headroom-ai` on each fresh web session. If you'd rather not run a
> third-party CLI before every shell command, keep only the `SessionStart` entry
> and drop the `PreToolUse` one.

## Deactivate / remove

Delete the `hooks` block from `settings.json` (or delete the file). To remove
entirely: delete `settings.headroom.example.json`, `hooks/headroom-ensure.sh`,
and this README, and `pip uninstall headroom-ai`.

## The fuller install (not done here)

`headroom init claude` installs Headroom's *durable* hooks **and provider
routing** — it stands up a local proxy (default port 8787) that routes the
agent's LLM traffic through Headroom for compression. That is intentionally NOT
set up here; it reroutes API traffic and is a much larger footprint than the
plugin. Run it yourself if you want the full product.
