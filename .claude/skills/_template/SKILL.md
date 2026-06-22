---
name: example-skill
description: Replace this with one clear sentence describing what the skill does and when Claude should use it. The description is how Claude decides to invoke the skill, so be specific about triggers.
---

# Example skill

Replace this file's contents with your skill instructions. Keep the folder name
short and kebab-case (it becomes the slash-command name, e.g. `/example-skill`).

## How to use this template

1. Copy this folder and rename it to your skill's name:
   `cp -R _template my-skill`
2. Edit the `description` in the frontmatter above — this is the most important
   line. Claude reads it to decide when to auto-invoke the skill.
3. Replace everything below the frontmatter with your actual instructions.
4. (Optional) add supporting files next to this `SKILL.md` and reference them by
   relative path, e.g. `see ./reference.md`.

## Writing good instructions

- Write for Claude, not for humans: imperative, concrete, step-by-step.
- State preconditions and the expected end state.
- If the skill should only run when the user explicitly asks, add
  `disable-model-invocation: true` to the frontmatter.
