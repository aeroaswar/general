---
type: permanent
tags: [ai, agents, memory]
area: 
source: "[[Compounding Agent Era — Dreaming]]"
created: 2026-06-19
---
# Dreaming is memory curation, not retraining

Anthropic's "Dreaming" makes an agent *appear* to learn overnight, but the model
weights never change. What changes is the **external memory store**: a scheduled
job replays past sessions, merges duplicates, drops stale facts, and writes a
cleaner store. The agent is smarter next session because it starts from a
better-organised memory — not because the underlying model improved.

## Why it matters
Keeps expectations honest. The lift comes from curation quality, so it helps
high-frequency, repetitive agents most and barely helps one-off agents. It also
explains the failure modes — bias amplification and hallucinated memory — because
pattern extraction is itself an LLM task, which is why the original memory is kept
and a separate file is offered for review.

## Connections
- Supports [[Agent competitive moat shifts from build speed to runtime]]
- Source: [[Compounding Agent Era — Dreaming]]
