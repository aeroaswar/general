#!/usr/bin/env bash
# headroom-ensure.sh
#
# Mirrors the Headroom plugin's hooks (headroomlabs-ai/headroom →
# plugins/headroom-agent-hooks/hooks/hooks.json). That plugin is normally
# installed via `/plugin marketplace add headroomlabs-ai/headroom`, but the
# git clone is blocked by this environment's egress policy, so the plugin's
# behaviour is reproduced here as a committed project hook instead.
#
# Modes:
#   install  (SessionStart) — ensure the `headroom` CLI is present (pip install
#            on first run), then run the upstream `headroom init hook ensure`.
#   default  (PreToolUse)  — only run `headroom init hook ensure` if the CLI is
#            already present; never installs mid-tool-call.
#
# Design goals: idempotent, non-fatal, silent. Always exits 0 so it can never
# block a tool call or fail a session start, even when offline or sandboxed.
set -u

mode="${1:-ensure}"

if [ "$mode" = "install" ] && ! command -v headroom >/dev/null 2>&1; then
  # First session start in a fresh (ephemeral) container: best-effort install.
  python3 -m pip install --quiet --disable-pip-version-check "headroom-ai" >/dev/null 2>&1 || true
fi

if command -v headroom >/dev/null 2>&1; then
  # Upstream helper: ensures any durable Headroom runtime is up. No-op when none
  # is deployed. This is the only command the plugin's hooks invoke.
  headroom init hook ensure >/dev/null 2>&1 || true
fi

exit 0
