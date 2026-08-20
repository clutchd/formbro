---
description: create atomic commits and push them
model: openai/gpt-5.6-luna-fast
---

Commit and push the staged changes. Invoking this command authorizes both operations.

Follow the shared commit policy below. It is the canonical policy for every agent:

@.agents/skills/commit/SKILL.md

Additional instructions: $ARGUMENTS

## Staged diff

!`git diff --cached`

## Worktree status

!`git status --short`
