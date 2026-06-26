\---  
name: benchmark-models  
preamble-tier: 1  
version: 1.0.0  
description: Cross-model benchmark for gstack skills. (gstack)  
triggers:  
 - cross model benchmark  
 - compare claude gpt gemini  
 - benchmark skill across models  
 - which model should I use  
allowed-tools:  
 - Bash  
 - Read  
 - AskUserQuestion  
\---  
\<\!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly --\>  
\<\!-- Regenerate: bun run gen:skill-docs --\>  
  
  
\#\# When to invoke this skill  
  
Runs the same prompt through Claude,  
GPT (via Codex CLI), and Gemini side-by-side — compares latency, tokens, cost,  
and optionally quality via LLM judge. Answers "which model is actually best  
for this skill?" with data instead of vibes. Separate from /benchmark, which  
measures web page performance. Use when: "benchmark models", "compare models",  
"which model is best for X", "cross-model comparison", "model shootout".  
  
Voice triggers (speech-to-text aliases): "compare models", "model shootout", "which model is best".  
  
\#\# Preamble (run first)  
  
\`\`\`bash  
\_UPD=$(\~/.claude/skills/gstack/bin/gstack-update-check 2\>/dev/null || .claude/skills/gstack/bin/gstack-update-check 2\>/dev/null || true)  
\[ -n "$\_UPD" \] && echo "$\_UPD" || true  
mkdir -p \~/.gstack/sessions  
touch \~/.gstack/sessions/"$PPID"  
\_SESSIONS=$(find \~/.gstack/sessions -mmin -120 -type f 2\>/dev/null | wc -l | tr -d ' ')  
find \~/.gstack/sessions -mmin +120 -type f -exec rm {} + 2\>/dev/null || true  
\_PROACTIVE=$(\~/.claude/skills/gstack/bin/gstack-config get proactive 2\>/dev/null || echo "true")  
\_PROACTIVE\_PROMPTED=$(\[ -f \~/.gstack/.proactive-prompted \] && echo "yes" || echo "no")  
\_BRANCH=$(git branch --show-current 2\>/dev/null || echo "unknown")  
echo "BRANCH: $\_BRANCH"  
\_SKILL\_PREFIX=$(\~/.claude/skills/gstack/bin/gstack-config get skill\_prefix 2\>/dev/null || echo "false")  
echo "PROACTIVE: $\_PROACTIVE"  
echo "PROACTIVE\_PROMPTED: $\_PROACTIVE\_PROMPTED"  
echo "SKILL\_PREFIX: $\_SKILL\_PREFIX"  
source \<(\~/.claude/skills/gstack/bin/gstack-repo-mode 2\>/dev/null) || true  
REPO\_MODE=${REPO\_MODE:-unknown}  
echo "REPO\_MODE: $REPO\_MODE"  
\_SESSION\_KIND=$(\~/.claude/skills/gstack/bin/gstack-session-kind 2\>/dev/null || echo "interactive")  
case "$\_SESSION\_KIND" in spawned|headless|interactive) ;; \*) \_SESSION\_KIND="interactive" ;; esac  
echo "SESSION\_KIND: $\_SESSION\_KIND"  
\# Conductor host: AskUserQuestion is unreliable here (native disabled, MCP  
\# variant flaky), so skills render decisions as prose instead of calling the  
\# tool. Gated on \!headless so an eval/CI run INSIDE Conductor (GSTACK\_HEADLESS)  
\# still BLOCKs rather than rendering prose to nobody.  
if \[ "$\_SESSION\_KIND" \!= "headless" \] && { \[ -n "${CONDUCTOR\_WORKSPACE\_PATH:-}" \] || \[ -n "${CONDUCTOR\_PORT:-}" \]; }; then  
 echo "CONDUCTOR\_SESSION: true"  
fi  
\_LAKE\_SEEN=$(\[ -f \~/.gstack/.completeness-intro-seen \] && echo "yes" || echo "no")  
echo "LAKE\_INTRO: $\_LAKE\_SEEN"  
\_TEL=$(\~/.claude/skills/gstack/bin/gstack-config get telemetry 2\>/dev/null || true)  
\_TEL\_PROMPTED=$(\[ -f \~/.gstack/.telemetry-prompted \] && echo "yes" || echo "no")  
\_TEL\_START=$(date +%s)  
\_SESSION\_ID="$$-$(date +%s)"  
echo "TELEMETRY: ${\_TEL:-off}"  
echo "TEL\_PROMPTED: $\_TEL\_PROMPTED"  
\_EXPLAIN\_LEVEL=$(\~/.claude/skills/gstack/bin/gstack-config get explain\_level 2\>/dev/null || echo "default")  
if \[ "$\_EXPLAIN\_LEVEL" \!= "default" \] && \[ "$\_EXPLAIN\_LEVEL" \!= "terse" \]; then \_EXPLAIN\_LEVEL="default"; fi  
echo "EXPLAIN\_LEVEL: $\_EXPLAIN\_LEVEL"  
\_QUESTION\_TUNING=$(\~/.claude/skills/gstack/bin/gstack-config get question\_tuning 2\>/dev/null || echo "false")  
echo "QUESTION\_TUNING: $\_QUESTION\_TUNING"  
mkdir -p \~/.gstack/analytics  
if \[ "$\_TEL" \!= "off" \]; then  
echo '{"skill":"benchmark-models","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(\_repo=$(basename "$(git rev-parse --show-toplevel 2\>/dev/null)" 2\>/dev/null | tr -cd 'a-zA-Z0-9.\_-'); echo "${\_repo:-unknown}")'"}' \>\> \~/.gstack/analytics/skill-usage.jsonl 2\>/dev/null || true  
fi  
for \_PF in $(find \~/.gstack/analytics -maxdepth 1 -name '.pending-\*' 2\>/dev/null); do  
 if \[ -f "$\_PF" \]; then  
 if \[ "$\_TEL" \!= "off" \] && \[ -x "\~/.claude/skills/gstack/bin/gstack-telemetry-log" \]; then  
 \~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type skill\_run --skill \_pending\_finalize --outcome unknown --session-id "$\_SESSION\_ID" 2\>/dev/null || true  
 fi  
 rm -f "$\_PF" 2\>/dev/null || true  
 fi  
 break  
done  
eval "$(\~/.claude/skills/gstack/bin/gstack-slug 2\>/dev/null)" 2\>/dev/null || true  
\_LEARN\_FILE="${GSTACK\_HOME:-$HOME/.gstack}/projects/${SLUG:-unknown}/learnings.jsonl"  
if \[ -f "$\_LEARN\_FILE" \]; then  
 \_LEARN\_COUNT=$(wc -l \< "$\_LEARN\_FILE" 2\>/dev/null | tr -d ' ')  
 echo "LEARNINGS: $\_LEARN\_COUNT entries loaded"  
 if \[ "$\_LEARN\_COUNT" -gt 5 \] 2\>/dev/null; then  
 \~/.claude/skills/gstack/bin/gstack-learnings-search --limit 3 2\>/dev/null || true  
 fi  
else  
 echo "LEARNINGS: 0"  
fi  
\~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"benchmark-models","event":"started","branch":"'"$\_BRANCH"'","session":"'"$\_SESSION\_ID"'"}' 2\>/dev/null &  
\_HAS\_ROUTING="no"  
if \[ -f CLAUDE.md \] && grep -q "\#\# Skill routing" CLAUDE.md 2\>/dev/null; then  
 \_HAS\_ROUTING="yes"  
fi  
\_ROUTING\_DECLINED=$(\~/.claude/skills/gstack/bin/gstack-config get routing\_declined 2\>/dev/null || echo "false")  
echo "HAS\_ROUTING: $\_HAS\_ROUTING"  
echo "ROUTING\_DECLINED: $\_ROUTING\_DECLINED"  
\_VENDORED="no"  
if \[ -d ".claude/skills/gstack" \] && \[ \! -L ".claude/skills/gstack" \]; then  
 if \[ -f ".claude/skills/gstack/VERSION" \] || \[ -d ".claude/skills/gstack/.git" \]; then  
 \_VENDORED="yes"  
 fi  
fi  
echo "VENDORED\_GSTACK: $\_VENDORED"  
echo "MODEL\_OVERLAY: claude"  
\_CHECKPOINT\_MODE=$(\~/.claude/skills/gstack/bin/gstack-config get checkpoint\_mode 2\>/dev/null || echo "explicit")  
\_CHECKPOINT\_PUSH=$(\~/.claude/skills/gstack/bin/gstack-config get checkpoint\_push 2\>/dev/null || echo "false")  
echo "CHECKPOINT\_MODE: $\_CHECKPOINT\_MODE"  
echo "CHECKPOINT\_PUSH: $\_CHECKPOINT\_PUSH"  
\# Plan-mode hint for skills like /spec that branch behavior on plan-mode state.  
\# Claude Code exposes plan mode via system reminders; we detect best-effort  
\# from CLAUDE\_PLAN\_FILE (set by the harness when plan mode is active) and  
\# fall back to "inactive". Codex hosts and Claude execution mode both end up  
\# inactive, which is the safe default (defaults to file+execute pipeline).  
if \[ -n "${CLAUDE\_PLAN\_FILE:-}${GSTACK\_PLAN\_MODE\_FORCE:-}" \]; then  
 export GSTACK\_PLAN\_MODE="active"  
elif \[ "${GSTACK\_PLAN\_MODE:-}" = "active" \]; then  
 export GSTACK\_PLAN\_MODE="active"  
else  
 export GSTACK\_PLAN\_MODE="inactive"  
fi  
echo "GSTACK\_PLAN\_MODE: $GSTACK\_PLAN\_MODE"  
\[ -n "$OPENCLAW\_SESSION" \] && echo "SPAWNED\_SESSION: true" || true  
\`\`\`  
  
\#\# Plan Mode Safe Operations  
  
In plan mode, allowed because they inform the plan: \`$B\`, \`$D\`, \`codex exec\`/\`codex review\`, writes to \`\~/.gstack/\`, writes to the plan file, and \`open\` for generated artifacts.  
  
\#\# Skill Invocation During Plan Mode  
  
If the user invokes a skill in plan mode, the skill takes precedence over generic plan mode behavior. \*\*Treat the skill file as executable instructions, not reference.\*\* Follow it step by step starting from Step 0; the first AskUserQuestion is the workflow entering plan mode, not a violation of it. AskUserQuestion (any variant — \`mcp\_\_\*\_\_AskUserQuestion\` or native; see "AskUserQuestion Format → Tool resolution") satisfies plan mode's end-of-turn requirement. If AskUserQuestion is unavailable or a call fails, follow the AskUserQuestion Format failure fallback: \`headless\` → BLOCKED; \`interactive\` → the prose fallback (also satisfies end-of-turn). At a STOP point, stop immediately. Do not continue the workflow or call ExitPlanMode there. Commands marked "PLAN MODE EXCEPTION — ALWAYS RUN" execute. Call ExitPlanMode only after the skill workflow completes, or if the user tells you to cancel the skill or leave plan mode.  
  
If \`PROACTIVE\` is \`"false"\`, do not auto-invoke or proactively suggest skills. If a skill seems useful, ask: "I think /skillname might help here — want me to run it?"  
  
If \`SKILL\_PREFIX\` is \`"true"\`, suggest/invoke \`/gstack-\*\` names. Disk paths stay \`\~/.claude/skills/gstack/\[skill-name\]/SKILL.md\`.  
  
If output shows \`UPGRADE\_AVAILABLE \<old\> \<new\>\`: read \`\~/.claude/skills/gstack/gstack-upgrade/SKILL.md\` and follow the "Inline upgrade flow" (auto-upgrade if configured, otherwise AskUserQuestion with 4 options, write snooze state if declined).  
  
If output shows \`JUST\_UPGRADED \<from\> \<to\>\`: print "Running gstack v{to} (just updated\!)". If \`SPAWNED\_SESSION\` is true, skip feature discovery.  
  
Feature discovery, max one prompt per session:  
\- Missing \`\~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint\`: AskUserQuestion for Continuous checkpoint auto-commits. If accepted, run \`\~/.claude/skills/gstack/bin/gstack-config set checkpoint\_mode continuous\`. Always touch marker.  
\- Missing \`\~/.claude/skills/gstack/.feature-prompted-model-overlay\`: inform "Model overlays are active. MODEL\_OVERLAY shows the patch." Always touch marker.  
  
After upgrade prompts, continue workflow.  
  
If \`WRITING\_STYLE\_PENDING\` is \`yes\`: ask once about writing style:  
  
\> v1 prompts are simpler: first-use jargon glosses, outcome-framed questions, shorter prose. Keep default or restore terse?  
  
Options:  
\- A) Keep the new default (recommended — good writing helps everyone)  
\- B) Restore V0 prose — set \`explain\_level: terse\`  
  
If A: leave \`explain\_level\` unset (defaults to \`default\`).  
If B: run \`\~/.claude/skills/gstack/bin/gstack-config set explain\_level terse\`.  
  
Always run (regardless of choice):  
\`\`\`bash  
rm -f \~/.gstack/.writing-style-prompt-pending  
touch \~/.gstack/.writing-style-prompted  
\`\`\`  
  
Skip if \`WRITING\_STYLE\_PENDING\` is \`no\`.  
  
If \`LAKE\_INTRO\` is \`no\`: say "gstack follows the \*\*Boil the Ocean\*\* principle — do the complete thing when AI makes marginal cost near-zero. Read more: https://garryslist.org/posts/boil-the-ocean" Offer to open:  
  
\`\`\`bash  
open https://garryslist.org/posts/boil-the-ocean  
touch \~/.gstack/.completeness-intro-seen  
\`\`\`  
  
Only run \`open\` if yes. Always run \`touch\`.  
  
If \`TEL\_PROMPTED\` is \`no\` AND \`LAKE\_INTRO\` is \`yes\`: ask telemetry once via AskUserQuestion:  
  
\> Help gstack get better. Share usage data only: skill, duration, crashes, stable device ID. No code or file paths. Your repo name is recorded locally only and stripped before any upload.  
  
Options:  
\- A) Help gstack get better\! (recommended)  
\- B) No thanks  
  
If A: run \`\~/.claude/skills/gstack/bin/gstack-config set telemetry community\`  
  
If B: ask follow-up:  
  
\> Anonymous mode sends only aggregate usage, no unique ID.  
  
Options:  
\- A) Sure, anonymous is fine  
\- B) No thanks, fully off  
  
If B→A: run \`\~/.claude/skills/gstack/bin/gstack-config set telemetry anonymous\`  
If B→B: run \`\~/.claude/skills/gstack/bin/gstack-config set telemetry off\`  
  
Always run:  
\`\`\`bash  
touch \~/.gstack/.telemetry-prompted  
\`\`\`  
  
Skip if \`TEL\_PROMPTED\` is \`yes\`.  
  
If \`PROACTIVE\_PROMPTED\` is \`no\` AND \`TEL\_PROMPTED\` is \`yes\`: ask once:  
  
\> Let gstack proactively suggest skills, like /qa for "does this work?" or /investigate for bugs?  
  
Options:  
\- A) Keep it on (recommended)  
\- B) Turn it off — I'll type /commands myself  
  
If A: run \`\~/.claude/skills/gstack/bin/gstack-config set proactive true\`  
If B: run \`\~/.claude/skills/gstack/bin/gstack-config set proactive false\`  
  
Always run:  
\`\`\`bash  
touch \~/.gstack/.proactive-prompted  
\`\`\`  
  
Skip if \`PROACTIVE\_PROMPTED\` is \`yes\`.  
  
If \`HAS\_ROUTING\` is \`no\` AND \`ROUTING\_DECLINED\` is \`false\` AND \`PROACTIVE\_PROMPTED\` is \`yes\`:  
Check if a CLAUDE.md file exists in the project root. If it does not exist, create it.  
  
Use AskUserQuestion:  
  
\> gstack works best when your project's CLAUDE.md includes skill routing rules.  
  
Options:  
\- A) Add routing rules to CLAUDE.md (recommended)  
\- B) No thanks, I'll invoke skills manually  
  
If A: Append this section to the end of CLAUDE.md:  
  
\`\`\`markdown  
  
\#\# Skill routing  
  
When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.  
  
Key routing rules:  
\- Product ideas/brainstorming → invoke /office-hours  
\- Strategy/scope → invoke /plan-ceo-review  
\- Architecture → invoke /plan-eng-review  
\- Design system/plan review → invoke /design-consultation or /plan-design-review  
\- Full review pipeline → invoke /autoplan  
\- Bugs/errors → invoke /investigate  
\- QA/testing site behavior → invoke /qa or /qa-only  
\- Code review/diff check → invoke /review  
\- Visual polish → invoke /design-review  
\- Ship/deploy/PR → invoke /ship or /land-and-deploy  
\- Save progress → invoke /context-save  
\- Resume context → invoke /context-restore  
\- Author a backlog-ready spec/issue → invoke /spec  
\`\`\`  
  
Then commit the change: \`git add CLAUDE.md && git commit -m "chore: add gstack skill routing rules to CLAUDE.md"\`  
  
If B: run \`\~/.claude/skills/gstack/bin/gstack-config set routing\_declined true\` and say they can re-enable with \`gstack-config set routing\_declined false\`.  
  
This only happens once per project. Skip if \`HAS\_ROUTING\` is \`yes\` or \`ROUTING\_DECLINED\` is \`true\`.  
  
If \`VENDORED\_GSTACK\` is \`yes\`, warn once via AskUserQuestion unless \`\~/.gstack/.vendoring-warned-$SLUG\` exists:  
  
\> This project has gstack vendored in \`.claude/skills/gstack/\`. Vendoring is deprecated.  
\> Migrate to team mode?  
  
Options:  
\- A) Yes, migrate to team mode now  
\- B) No, I'll handle it myself  
  
If A:  
1\. Run \`git rm -r .claude/skills/gstack/\`  
2\. Run \`echo '.claude/skills/gstack/' \>\> .gitignore\`  
3\. Run \`\~/.claude/skills/gstack/bin/gstack-team-init required\` (or \`optional\`)  
4\. Run \`git add .claude/ .gitignore CLAUDE.md && git commit -m "chore: migrate gstack from vendored to team mode"\`  
5\. Tell the user: "Done. Each developer now runs: \`cd \~/.claude/skills/gstack && ./setup --team\`"  
  
If B: say "OK, you're on your own to keep the vendored copy up to date."  
  
Always run (regardless of choice):  
\`\`\`bash  
eval "$(\~/.claude/skills/gstack/bin/gstack-slug 2\>/dev/null)" 2\>/dev/null || true  
touch \~/.gstack/.vendoring-warned-${SLUG:-unknown}  
\`\`\`  
  
If marker exists, skip.  
  
If \`SPAWNED\_SESSION\` is \`"true"\`, you are running inside a session spawned by an  
AI orchestrator (e.g., OpenClaw). In spawned sessions:  
\- Do NOT use AskUserQuestion for interactive prompts. Auto-choose the recommended option.  
\- Do NOT run upgrade checks, telemetry prompts, routing injection, or lake intro.  
\- Focus on completing the task and reporting results via prose output.  
\- End with a completion report: what shipped, decisions made, anything uncertain.  
  
\#\# Artifacts Sync (skill start)  
  
\`\`\`bash  
\_GSTACK\_HOME="${GSTACK\_HOME:-$HOME/.gstack}"  
\# Prefer the v1.27.0.0 artifacts file; fall back to brain file for users  
\# upgrading mid-stream before the migration script runs.  
if \[ -f "$HOME/.gstack-artifacts-remote.txt" \]; then  
 \_BRAIN\_REMOTE\_FILE="$HOME/.gstack-artifacts-remote.txt"  
else  
 \_BRAIN\_REMOTE\_FILE="$HOME/.gstack-brain-remote.txt"  
fi  
\_BRAIN\_SYNC\_BIN="\~/.claude/skills/gstack/bin/gstack-brain-sync"  
\_BRAIN\_CONFIG\_BIN="\~/.claude/skills/gstack/bin/gstack-config"  
  
\# /sync-gbrain context-load: teach the agent to use gbrain when it's available.  
\# Per-worktree pin: post-spike redesign uses kubectl-style \`.gbrain-source\` in the  
\# git toplevel to scope queries. Look for the pin in the worktree (not a global  
\# state file) so that opening worktree B without a pin doesn't claim "indexed"  
\# just because worktree A was synced. Empty string when gbrain is not  
\# configured (zero context cost for non-gbrain users).  
\_GBRAIN\_CONFIG="$HOME/.gbrain/config.json"  
if \[ -f "$\_GBRAIN\_CONFIG" \] && command -v gbrain \>/dev/null 2\>&1; then  
 \_GBRAIN\_VERSION\_OK=$(gbrain --version 2\>/dev/null | grep -c '^gbrain ' || echo 0)  
 if \[ "$\_GBRAIN\_VERSION\_OK" -gt 0 \] 2\>/dev/null; then  
 \_GBRAIN\_PIN\_PATH=""  
 \_REPO\_TOP=$(git rev-parse --show-toplevel 2\>/dev/null || echo "")  
 if \[ -n "$\_REPO\_TOP" \] && \[ -f "$\_REPO\_TOP/.gbrain-source" \]; then  
 \_GBRAIN\_PIN\_PATH="$\_REPO\_TOP/.gbrain-source"  
 fi  
 if \[ -n "$\_GBRAIN\_PIN\_PATH" \]; then  
 echo "GBrain configured. Prefer \\\`gbrain search\\\`/\\\`gbrain query\\\` over Grep for"  
 echo "semantic questions; use \\\`gbrain code-def\\\`/\\\`code-refs\\\`/\\\`code-callers\\\` for"  
 echo "symbol-aware code lookup. See \\"\#\# GBrain Search Guidance\\" in CLAUDE.md."  
 echo "Run /sync-gbrain to refresh."  
 else  
 echo "GBrain configured but this worktree isn't pinned yet. Run \\\`/sync-gbrain --full\\\`"  
 echo "before relying on \\\`gbrain search\\\` for code questions in this worktree."  
 echo "Falls back to Grep until pinned."  
 fi  
 fi  
fi  
  
\_BRAIN\_SYNC\_MODE=$("$\_BRAIN\_CONFIG\_BIN" get artifacts\_sync\_mode 2\>/dev/null || echo off)  
  
\# Detect remote-MCP mode (Path 4 of /setup-gbrain). Local artifacts sync is  
\# a no-op in remote mode; the brain server pulls from GitHub/GitLab on its  
\# own cadence. Read claude.json directly to keep this preamble fast (no  
\# subprocess to claude CLI on every skill start).  
\_GBRAIN\_MCP\_MODE="none"  
if command -v jq \>/dev/null 2\>&1 && \[ -f "$HOME/.claude.json" \]; then  
 \_GBRAIN\_MCP\_TYPE=$(jq -r '.mcpServers.gbrain.type // .mcpServers.gbrain.transport // empty' "$HOME/.claude.json" 2\>/dev/null)  
 case "$\_GBRAIN\_MCP\_TYPE" in  
 url|http|sse) \_GBRAIN\_MCP\_MODE="remote-http" ;;  
 stdio) \_GBRAIN\_MCP\_MODE="local-stdio" ;;  
 esac  
fi  
  
if \[ -f "$\_BRAIN\_REMOTE\_FILE" \] && \[ \! -d "$\_GSTACK\_HOME/.git" \] && \[ "$\_BRAIN\_SYNC\_MODE" = "off" \]; then  
 \_BRAIN\_NEW\_URL=$(head -1 "$\_BRAIN\_REMOTE\_FILE" 2\>/dev/null | tr -d '\[:space:\]')  
 if \[ -n "$\_BRAIN\_NEW\_URL" \]; then  
 echo "ARTIFACTS\_SYNC: artifacts repo detected: $\_BRAIN\_NEW\_URL"  
 echo "ARTIFACTS\_SYNC: run 'gstack-brain-restore' to pull your cross-machine artifacts (or 'gstack-config set artifacts\_sync\_mode off' to dismiss forever)"  
 fi  
fi  
  
if \[ -d "$\_GSTACK\_HOME/.git" \] && \[ "$\_BRAIN\_SYNC\_MODE" \!= "off" \]; then  
 \_BRAIN\_LAST\_PULL\_FILE="$\_GSTACK\_HOME/.brain-last-pull"  
 \_BRAIN\_NOW=$(date +%s)  
 \_BRAIN\_DO\_PULL=1  
 if \[ -f "$\_BRAIN\_LAST\_PULL\_FILE" \]; then  
 \_BRAIN\_LAST=$(cat "$\_BRAIN\_LAST\_PULL\_FILE" 2\>/dev/null || echo 0)  
 \_BRAIN\_AGE=$(( \_BRAIN\_NOW - \_BRAIN\_LAST ))  
 \[ "$\_BRAIN\_AGE" -lt 86400 \] && \_BRAIN\_DO\_PULL=0  
 fi  
 if \[ "$\_BRAIN\_DO\_PULL" = "1" \]; then  
 ( cd "$\_GSTACK\_HOME" && git fetch origin \>/dev/null 2\>&1 && git merge --ff-only "origin/$(git rev-parse --abbrev-ref HEAD)" \>/dev/null 2\>&1 ) || true  
 echo "$\_BRAIN\_NOW" \> "$\_BRAIN\_LAST\_PULL\_FILE"  
 fi  
 "$\_BRAIN\_SYNC\_BIN" --once 2\>/dev/null || true  
fi  
  
if \[ "$\_GBRAIN\_MCP\_MODE" = "remote-http" \]; then  
 \# Remote-MCP mode: local artifacts sync is a no-op (brain admin's server  
 \# pulls from GitHub/GitLab). Show the user this is by design, not broken.  
 \_GBRAIN\_HOST=$(jq -r '.mcpServers.gbrain.url // empty' "$HOME/.claude.json" 2\>/dev/null | sed -E 's|^https?://(\[^/:\]+).\*|\\1|')  
 echo "ARTIFACTS\_SYNC: remote-mode (managed by brain server ${\_GBRAIN\_HOST:-remote})"  
elif \[ -d "$\_GSTACK\_HOME/.git" \] && \[ "$\_BRAIN\_SYNC\_MODE" \!= "off" \]; then  
 \_BRAIN\_QUEUE\_DEPTH=0  
 \[ -f "$\_GSTACK\_HOME/.brain-queue.jsonl" \] && \_BRAIN\_QUEUE\_DEPTH=$(wc -l \< "$\_GSTACK\_HOME/.brain-queue.jsonl" | tr -d ' ')  
 \_BRAIN\_LAST\_PUSH="never"  
 \[ -f "$\_GSTACK\_HOME/.brain-last-push" \] && \_BRAIN\_LAST\_PUSH=$(cat "$\_GSTACK\_HOME/.brain-last-push" 2\>/dev/null || echo never)  
 echo "ARTIFACTS\_SYNC: mode=$\_BRAIN\_SYNC\_MODE | last\_push=$\_BRAIN\_LAST\_PUSH | queue=$\_BRAIN\_QUEUE\_DEPTH"  
else  
 echo "ARTIFACTS\_SYNC: off"  
fi  
\`\`\`  
  
  
  
Privacy stop-gate: if output shows \`ARTIFACTS\_SYNC: off\`, \`artifacts\_sync\_mode\_prompted\` is \`false\`, and gbrain is on PATH or \`gbrain doctor --fast --json\` works, ask once:  
  
\> gstack can publish your artifacts (CEO plans, designs, reports) to a private GitHub repo that GBrain indexes across machines. How much should sync?  
  
Options:  
\- A) Everything allowlisted (recommended)  
\- B) Only artifacts  
\- C) Decline, keep everything local  
  
After answer:  
  
\`\`\`bash  
\# Chosen mode: full | artifacts-only | off  
"$\_BRAIN\_CONFIG\_BIN" set artifacts\_sync\_mode \<choice\>  
"$\_BRAIN\_CONFIG\_BIN" set artifacts\_sync\_mode\_prompted true  
\`\`\`  
  
If A/B and \`\~/.gstack/.git\` is missing, ask whether to run \`gstack-artifacts-init\`. Do not block the skill.  
  
At skill END before telemetry:  
  
\`\`\`bash  
"\~/.claude/skills/gstack/bin/gstack-brain-sync" --discover-new 2\>/dev/null || true  
"\~/.claude/skills/gstack/bin/gstack-brain-sync" --once 2\>/dev/null || true  
\`\`\`  
  
  
\#\# Model-Specific Behavioral Patch (claude)  
  
The following nudges are tuned for the claude model family. They are  
\*\*subordinate\*\* to skill workflow, STOP points, AskUserQuestion gates, plan-mode  
safety, and /ship review gates. If a nudge below conflicts with skill instructions,  
the skill wins. Treat these as preferences, not rules.  
  
\*\*Todo-list discipline.\*\* When working through a multi-step plan, mark each task  
complete individually as you finish it. Do not batch-complete at the end. If a task  
turns out to be unnecessary, mark it skipped with a one-line reason.  
  
\*\*Think before heavy actions.\*\* For complex operations (refactors, migrations,  
non-trivial new features), briefly state your approach before executing. This lets  
the user course-correct cheaply instead of mid-flight.  
  
\*\*Dedicated tools over Bash.\*\* Prefer Read, Edit, Write, Glob, Grep over shell  
equivalents (cat, sed, find, grep). The dedicated tools are cheaper and clearer.  
  
\#\# Voice  
  
Direct, concrete, builder-to-builder. Name the file, function, command, and user-visible impact. No filler.  
  
No em dashes. No AI vocabulary: delve, crucial, robust, comprehensive, nuanced, multifaceted. Never corporate or academic. Short paragraphs. End with what to do.  
  
The user has context you do not. Cross-model agreement is a recommendation, not a decision. The user decides.  
  
\#\# Completion Status Protocol  
  
When completing a skill workflow, report status using one of:  
\- \*\*DONE\*\* — completed with evidence.  
\- \*\*DONE\_WITH\_CONCERNS\*\* — completed, but list concerns.  
\- \*\*BLOCKED\*\* — cannot proceed; state blocker and what was tried.  
\- \*\*NEEDS\_CONTEXT\*\* — missing info; state exactly what is needed.  
  
Escalate after 3 failed attempts, uncertain security-sensitive changes, or scope you cannot verify. Format: \`STATUS\`, \`REASON\`, \`ATTEMPTED\`, \`RECOMMENDATION\`.  
  
\#\# Operational Self-Improvement  
  
Before completing, if you discovered a durable project quirk or command fix that would save 5+ minutes next time, log it:  
  
\`\`\`bash  
\~/.claude/skills/gstack/bin/gstack-learnings-log '{"skill":"SKILL\_NAME","type":"operational","key":"SHORT\_KEY","insight":"DESCRIPTION","confidence":N,"source":"observed"}'  
\`\`\`  
  
Do not log obvious facts or one-time transient errors.  
  
\#\# Telemetry (run last)  
  
After workflow completion, log telemetry. Use skill \`name:\` from frontmatter. OUTCOME is success/error/abort/unknown.  
  
\*\*PLAN MODE EXCEPTION — ALWAYS RUN:\*\* This command writes telemetry to  
\`\~/.gstack/analytics/\`, matching preamble analytics writes.  
  
Run this bash:  
  
\`\`\`bash  
\_TEL\_END=$(date +%s)  
\_TEL\_DUR=$(( \_TEL\_END - \_TEL\_START ))  
rm -f \~/.gstack/analytics/.pending-"$\_SESSION\_ID" 2\>/dev/null || true  
\# Session timeline: record skill completion (local-only, never sent anywhere)  
\~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"SKILL\_NAME","event":"completed","branch":"'$(git branch --show-current 2\>/dev/null || echo unknown)'","outcome":"OUTCOME","duration\_s":"'"$\_TEL\_DUR"'","session":"'"$\_SESSION\_ID"'"}' 2\>/dev/null || true  
\# Local analytics (gated on telemetry setting)  
if \[ "$\_TEL" \!= "off" \]; then  
echo '{"skill":"SKILL\_NAME","duration\_s":"'"$\_TEL\_DUR"'","outcome":"OUTCOME","browse":"USED\_BROWSE","session":"'"$\_SESSION\_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' \>\> \~/.gstack/analytics/skill-usage.jsonl 2\>/dev/null || true  
fi  
\# Remote telemetry (opt-in, requires binary)  
if \[ "$\_TEL" \!= "off" \] && \[ -x \~/.claude/skills/gstack/bin/gstack-telemetry-log \]; then  
 \~/.claude/skills/gstack/bin/gstack-telemetry-log \\  
 --skill "SKILL\_NAME" --duration "$\_TEL\_DUR" --outcome "OUTCOME" \\  
 --used-browse "USED\_BROWSE" --session-id "$\_SESSION\_ID" 2\>/dev/null &  
fi  
\`\`\`  
  
Replace \`SKILL\_NAME\`, \`OUTCOME\`, and \`USED\_BROWSE\` before running.  
  
\#\# Plan Status Footer  
  
Skills that run plan reviews (\`/plan-\*-review\`, \`/codex review\`) include the EXIT PLAN MODE GATE blocking checklist at the end of the skill, which verifies the plan file ends with \`\#\# GSTACK REVIEW REPORT\` before ExitPlanMode is called. Skills that don't run plan reviews (operational skills like \`/ship\`, \`/qa\`, \`/review\`) typically don't operate in plan mode and have no review report to verify; this footer is a no-op for them. Writing the plan file is the one edit allowed in plan mode.  
  
\# /benchmark-models — Cross-Model Skill Benchmark  
  
You are running the \`/benchmark-models\` workflow. Wraps the \`gstack-model-benchmark\` binary with an interactive flow that picks a prompt, confirms providers, previews auth, and runs the benchmark.  
  
Different from \`/benchmark\` — that skill measures web page performance (Core Web Vitals, load times). This skill measures AI model performance on gstack skills or arbitrary prompts.  
  
\---  
  
\#\# Step 0: Locate the binary  
  
\`\`\`bash  
BIN="$HOME/.claude/skills/gstack/bin/gstack-model-benchmark"  
\[ -x "$BIN" \] || BIN=".claude/skills/gstack/bin/gstack-model-benchmark"  
\[ -x "$BIN" \] || { echo "ERROR: gstack-model-benchmark not found. Run ./setup in the gstack install dir." \>&2; exit 1; }  
echo "BIN: $BIN"  
\`\`\`  
  
If not found, stop and tell the user to reinstall gstack.  
  
\---  
  
\#\# Step 1: Choose a prompt  
  
Use AskUserQuestion with the preamble format:  
\- \*\*Re-ground:\*\* current project + branch.  
\- \*\*Simplify:\*\* "A cross-model benchmark runs the same prompt through 2-3 AI models and shows you how they compare on speed, cost, and output quality. What prompt should we use?"  
\- \*\*RECOMMENDATION:\*\* A because benchmarking against a real skill exposes tool-use differences, not just raw generation.  
\- \*\*Options:\*\*  
 - A) Benchmark one of my gstack skills (we'll pick which skill next). Completeness: 10/10.  
 - B) Use an inline prompt — type it on the next turn. Completeness: 8/10.  
 - C) Point at a prompt file on disk — specify path on the next turn. Completeness: 8/10.  
  
If A: list top-level gstack skills that have SKILL.md files (from \`find . -maxdepth 2 -name SKILL.md -not -path './.\*'\`), ask the user to pick one via a second AskUserQuestion. Use the picked SKILL.md path as the prompt file.  
  
If B: ask the user for the inline prompt. Use it verbatim via \`--prompt "\<text\>"\`.  
  
If C: ask for the path. Verify it exists. Use as positional argument.  
  
\---  
  
\#\# Step 2: Choose providers  
  
\`\`\`bash  
"$BIN" --prompt "unused, dry-run" --models claude,gpt,gemini --dry-run  
\`\`\`  
  
Show the dry-run output. The "Adapter availability" section tells the user which providers will actually run (OK) vs skip (NOT READY — remediation hint included).  
  
If ALL three show NOT READY: stop with a clear message — benchmark can't run without at least one authed provider. Suggest \`claude login\`, \`codex login\`, or \`gemini login\` / \`export GOOGLE\_API\_KEY\`.  
  
If at least one is OK: AskUserQuestion:  
\- \*\*Simplify:\*\* "Which models should we include? The dry-run above showed which are authed. Unauthed ones will be skipped cleanly — they won't abort the batch."  
\- \*\*RECOMMENDATION:\*\* A (all authed providers) because running as many as possible gives the richest comparison.  
\- \*\*Options:\*\*  
 - A) All authed providers. Completeness: 10/10.  
 - B) Only Claude. Completeness: 6/10 (no cross-model signal — use /ship's review for solo claude benchmarks instead).  
 - C) Pick two — specify on next turn. Completeness: 8/10.  
  
\---  
  
\#\# Step 3: Decide on judge  
  
\`\`\`bash  
\[ -n "$ANTHROPIC\_API\_KEY" \] || grep -q 'ANTHROPIC' "$HOME/.claude/.credentials.json" 2\>/dev/null && echo "JUDGE\_AVAILABLE" || echo "JUDGE\_UNAVAILABLE"  
\`\`\`  
  
If judge is available, AskUserQuestion:  
\- \*\*Simplify:\*\* "The quality judge scores each model's output on a 0-10 scale using Anthropic's Claude as a tiebreaker. Adds \~$0.05/run. Recommended if you care about output quality, not just latency and cost."  
\- \*\*RECOMMENDATION:\*\* A — the whole point is comparing quality, not just speed.  
\- \*\*Options:\*\*  
 - A) Enable judge (adds \~$0.05). Completeness: 10/10.  
 - B) Skip judge — speed/cost/tokens only. Completeness: 7/10.  
  
If judge is NOT available, skip this question and omit the \`--judge\` flag.  
  
\---  
  
\#\# Step 4: Run the benchmark  
  
Construct the command from Step 1, 2, 3 decisions:  
  
\`\`\`bash  
"$BIN" \<prompt-spec\> --models \<picked-models\> \[--judge\] --output table  
\`\`\`  
  
Where \`\<prompt-spec\>\` is either \`--prompt "\<text\>"\` (Step 1B), a file path (Step 1A or 1C), and \`\<picked-models\>\` is the comma-separated list from Step 2.  
  
Stream the output as it arrives. This is slow — each provider runs the prompt fully. Expect 30s-5min depending on prompt complexity and whether \`--judge\` is on.  
  
\---  
  
\#\# Step 5: Interpret results  
  
After the table prints, summarize for the user:  
\- \*\*Fastest\*\* — provider with lowest latency.  
\- \*\*Cheapest\*\* — provider with lowest cost.  
\- \*\*Highest quality\*\* (if \`--judge\` ran) — provider with highest score.  
\- \*\*Best overall\*\* — use judgment. If judge ran: quality-weighted. Otherwise: note the tradeoff the user needs to make.  
  
If any provider hit an error (auth/timeout/rate\_limit), call it out with the remediation path.  
  
\---  
  
\#\# Step 6: Offer to save results  
  
AskUserQuestion:  
\- \*\*Simplify:\*\* "Save this benchmark as JSON so you can compare future runs against it?"  
\- \*\*RECOMMENDATION:\*\* A — skill performance drifts as providers update their models; a saved baseline catches quality regressions.  
\- \*\*Options:\*\*  
 - A) Save to \`\~/.gstack/benchmarks/\<date\>-\<skill-or-prompt-slug\>.json\`. Completeness: 10/10.  
 - B) Just print, don't save. Completeness: 5/10 (loses trend data).  
  
If A: re-run with \`--output json\` and tee to the dated file. Print the path so the user can diff future runs against it.  
  
\---  
  
\#\# Important Rules  
  
\- \*\*Never run a real benchmark without Step 2's dry-run first.\*\* Users need to see auth status before spending API calls.  
\- \*\*Never hardcode model names.\*\* Always pass providers from user's Step 2 choice — the binary handles the rest.  
\- \*\*Never auto-include \`--judge\`.\*\* It adds real cost; user must opt in.  
\- \*\*If zero providers are authed, STOP.\*\* Don't attempt the benchmark — it produces no useful output.  
\- \*\*Cost is visible.\*\* Every run shows per-provider cost in the table. Users should see it before the next run.  