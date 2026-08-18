---
description: git commit
model: openai/gpt-5.6-luna-fast
variant: max
---

commit and push staged changes atomically

make sure it includes a prefix like

- `feat:` or `feat(scope):` for new features
- `fix:` or `fix(scope):` for bug fixes
- `docs:` or `docs(scope):` for documentation changes
- `chore:` or `chore(scope):` for maintenance tasks
- `refactor:` or `refactor(scope):` for code refactoring
- `test:` or `test(scope):` for adding or updating tests

Where `scope` is the package name (e.g., `web`, `convex`, `core`).

prefer to explain WHY something was done from an end user perspective instead of
WHAT was done.

do not do generic messages like "improved agent experience" be very specific
about what user facing changes were made

if there are conflicts DO NOT FIX THEM. notify me and I will fix them

## GIT DIFF

!`git diff`

## GIT DIFF --cached

!`git diff --cached`

## GIT STATUS --short

!`git status --short`
