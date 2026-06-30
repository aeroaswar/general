---
name: feedback-loops
description: User correction, thumbs up/down, inline editing, and reinforcement signals.
---
# Feedback Loops
Feedback loops are how users tell the AI what's working and what isn't. Designing these loops well is the difference between an AI that improves over time and one that repeats the same mistakes.
## Types of Feedback
- **Explicit feedback**: Thumbs up/down, star ratings, "this was helpful/not helpful" buttons
- **Implicit feedback**: Regeneration (user asks again), editing (user modifies the output), abandonment (user leaves)
- **Corrective feedback**: User provides the right answer ("No, I meant X not Y")
- **Preference feedback**: User chooses between alternatives ("I prefer option B")
- **Contextual feedback**: Feedback tied to a specific part of the output, not the whole response
## Designing for Correction
The most valuable feedback is correction — but it's also the hardest to design for:
- **Inline editing**: Let users edit AI output directly. Track what they change.
- **Partial acceptance**: Let users keep some parts and reject others.
- **Explanation requests**: "Why did you do it this way?" — the user's question reveals what went wrong.
- **Redo with guidance**: "Try again but make it more formal" — correction through re-prompting.
## Feedback Timing
When to ask for feedback matters:
- **Too early**: User hasn't evaluated the output yet. Feedback is premature.
- **Too late**: User has moved on. The moment for feedback has passed.
- **Interruptive**: Modal dialogs or or first-use prompts.
## Design Artefacts
- Capability disclosure maps showing what's revealed when
- Mental model progression diagrams
- First-use experience flows with disclosure triggers
- Capability tier definitions (surface, intermediate, power)
