---
type: literature
status: done
source: "[[Compounding Agent Era — Dreaming]]"
author: "Do This With AI"
tags: [literature, ai, agents, anthropic]
created: 2026-06-19
---
# Dreaming — self-improving agents (lit)

**Source:** [[Compounding Agent Era — Dreaming]] · **Status:** done

## Summary
"Dreaming" is a scheduled background process that runs **between** agent sessions:
it replays past transcripts, extracts patterns, and rewrites the agent's external
memory store — so the agent starts the next session smarter. It is memory
curation, not retraining; model weights never change.

## Key points
- **4-stage dream cycle:** Replay (≤100 transcripts) → Pattern extraction (recurring
  mistakes, converged workflows, stale facts) → Memory rewrite (merge dupes,
  replace stale, add insights → a *new* store) → Handoff (auto-live or human review; original never overwritten, rollback any time).
- Launched May 6 2026 at Code with Claude; research preview; ran on Opus 4.7 / Sonnet 4.6; standard API token billing.
- Business shift: the static-agent model breaks — agents now **compound**, so the moat moves from *build speed* to *runtime* (how long an agent has been dreaming).
- Risks: bias amplification, hallucinated memory, narrow validation, token cost on long histories, client lock-in.

## Quotes
> "Your agent reviews yesterday and gets better overnight."

> "The moat is shifting from build speed to runtime."

## My take / questions
- The runtime-as-moat idea reframes my agent work: deploy *early* on a client's
  data so the compounding clock starts ticking.
- Worth pricing on outcome/lift (90-day rolling window) rather than flat retainer.
- Open q: at what session frequency does nightly vs weekly dreaming pay for itself?

## Spawned ideas
- [[Dreaming is memory curation, not retraining]]
- [[Agent competitive moat shifts from build speed to runtime]]
