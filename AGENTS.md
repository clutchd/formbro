# FormBro Agent Guide

FormBro is the open-source form platform for serious workflows.

## Working Agreement

- Inspect the existing implementation, tests, and types before changing behavior. Read dependency source when its contract is material; do not guess from memory.
- Preserve unrelated user changes and keep each change focused on the requested outcome.
- Use Bun and the existing workspace scripts. Prefer existing dependencies and patterns unless a new dependency has a clear benefit.
- Keep progress and handoff messages concise. Report outcomes, verification, risks, and blockers; omit routine tool narration.

## Product Priorities

- Performance: avoid waterfalls, parallelize independent work, and use optimistic updates with a clear rollback path.
- Good defaults: prefer safe behavior that needs less configuration.
- Convenience: minimize clicks and blocking states without weakening security.

## Durable Invariants

- Form and element IDs are stable identity. Never derive them from mutable names, labels, placeholders, or interpolated text.
- Private Convex operations must authorize workspace or form access before returning or mutating protected data.
- Public submissions must target an open form and its current published schema.
- Never send secrets or form submission contents to logs, analytics, or error-reporting tools.

## Repository Map

- `packages/core`: durable schemas, compilation, and validation.
- `packages/react`: React form rendering and builder behavior.
- `packages/ui`: generic interactive UI primitives.
- `packages/convex`: authentication, persistence, billing, and server workflows.
- `packages/web`: the Next.js application and product UI.
- `packages/email`: transactional and marketing email UI.
- `packages/storybook`: UI documentation and visual checks.

## Task-Specific Guidance

- Before changing user-facing UI, read `docs/design.md`.
- Before changing the core form contract, read `packages/core/README.md`.
- Before every commit, load and follow `.agents/skills/commit/SKILL.md`. This is the canonical commit policy for every agent and tool.

## Verification

- Add or update regression tests for behavior changes.
- During iteration, run the smallest relevant test and typecheck commands.
- Before handing off code changes, run `bun run verify`. If it cannot run, state exactly what was skipped and why.

## Git

- Do not commit or push unless the user or an invoked command explicitly requests it.
- Keep commits atomic: one coherent intent, including its tests and documentation, per commit.
