---
name: commit
description: Create atomic conventional commits for FormBro. Use whenever a user asks to commit, commit and push, save work in Git, prepare commits, or write or validate a commit message, and before any agent runs git commit.
---

# Commit Changes

Create the requested commit without absorbing unrelated work.

## Establish authority and scope

- Treat a request to commit as authorization to create local commits only.
- Push only when the user or invoking command explicitly requests it.
- Never amend, rebase, force-push, or resolve conflicts unless the user separately requests that operation.
- If a conflict or rejected push requires history changes, stop and report it.

## Inspect before staging

1. Run `git status --short`, `git diff`, and `git diff --cached`.
2. Identify which changes belong to the requested work and which are unrelated.
3. If changes are already staged, treat them as the intended scope. Do not add unstaged or untracked files unless they are clearly required for the same change.
4. Check for secrets, debug artifacts, generated noise, and accidental files before committing.

## Plan atomic commits

- Give each commit one coherent intent. A feature and its tests or documentation belong together; unrelated fixes do not.
- Split changes when they can be reviewed, reverted, or explained independently.
- Stage explicit paths or hunks. Never use `git add .`, `git add -A`, or `git commit -a`.
- Preserve unrelated worktree changes. If safely splitting mixed changes requires editing or resolving ambiguous hunks, stop and explain the required split instead of guessing.

## Verify each commit

1. Run `git diff --cached --check`.
2. Review `git diff --cached` as the reviewer will see it.
3. Run the smallest relevant tests, typechecks, or build for the staged behavior. Do not block documentation-only commits on an unrelated full build.
4. Do not bypass failing hooks or checks. Report checks that could not run.

## Write the message

Use `type(scope): subject` when one package or area provides a useful scope; otherwise use `type: subject`.

Allowed types:

- `feat`: user-facing capability
- `fix`: defect correction
- `docs`: documentation only
- `refactor`: behavior-preserving restructuring
- `test`: test-only change
- `perf`: performance improvement
- `ci`: CI workflow change
- `build`: build or dependency-system change
- `chore`: maintenance not covered above

Use a package name such as `web`, `convex`, `core`, `react`, or `ui` as the scope when appropriate. Use a tooling area such as `agents` when that is more precise.

Write a specific, imperative subject that explains the outcome or reason from the user's perspective. Avoid generic subjects such as `improve agent experience` or summaries that merely list files.

Examples:

- `fix(auth): preserve protected route after sign-in`
- `perf(web): prewarm form queries during navigation`
- `chore(agents): share atomic commit guidance`

## Commit and optionally push

1. Commit each planned group separately with its validated message.
2. After each commit, inspect `git status --short` and confirm unrelated changes remain untouched.
3. Push the current branch only when authorized. Never force-push.
4. Report commit hashes and subjects, checks run, push status, and any remaining worktree changes.
