# FormBro Agent Guide

Read the code to understand what's going on, yes even node_modules.

## Mission

FormBro is the open-source form platform for serious workflows.

## Cursor Cloud specific instructions

Use Bun 1.3.11. After checkout, run `bun install --frozen-lockfile`. Bun lives at `~/.bun/bin/bun` (added to `~/.bashrc`, so interactive shells find it on `PATH`; non-interactive scripts may need the full path).

For routine verification, run `bun run verify`. This checks lint and formatting without mutating files, runs the Bun test suites exposed through Turbo, and typechecks packages that expose a `typecheck` script.

Use `bun run lint` only when you intend to apply formatting fixes. Use `bun run lint:check` in CI, reviews, and quick agent verification.

`bun run build` may require a populated `.env` and deployment secrets because the web build is tied to Convex and Vercel deployment. Prefer `bun run verify` for portable agent checks that should work without production credentials.

### Running the app locally

The product is a Next.js web app (`packages/web`, port 3000) backed by a Convex deployment (`packages/convex`). Standard scripts live in each package's `package.json` (`bun run dev`, etc.); Bun loads the root `.env` via `--env-file=../../.env`.

Backend: the injected `CONVEX_DEPLOYMENT` / `NEXT_PUBLIC_CONVEX_URL` point at a cloud dev deployment that has no functions deployed and cannot be pushed without a `CONVEX_DEPLOY_KEY` (or an interactive `convex login`). For a no-credentials local backend, run Convex in anonymous mode with the cloud vars unset:

```
cd packages/convex
env -u CONVEX_DEPLOYMENT -u CONVEX_DEPLOY_KEY -u NEXT_PUBLIC_CONVEX_URL -u NEXT_PUBLIC_CONVEX_SITE_URL \
  CONVEX_AGENT_MODE=anonymous bun convex dev
```

This serves the client API at `http://127.0.0.1:3210` and HTTP actions at `http://127.0.0.1:3211`. Deployment-side env vars (needed at module load, e.g. `RESEND_API_KEY`, `NEXT_PUBLIC_POSTHOG_KEY`) are set on the local deployment; add/refresh them with `convex env set --from-file <file>` (same unset+`CONVEX_AGENT_MODE=anonymous` prefix).

- Gotcha (re-push loop): the Convex functions root is the whole `packages/convex` dir (`functions: "./"`). The local backend must NOT store its state there or `convex dev` loops forever printing "Filesystem changed during push, retrying...". Keep local state in the home dir at `~/.convex/anonymous-convex-backend-state/<deployment-name>` (the legacy location), not in a project-local `packages/convex/.convex/`. The Convex CLI (1.40) picks the legacy dir only if it already exists; otherwise it creates project-local state under `packages/convex/.convex/local/default/` and loops. The snapshot already has state in the legacy dir (deployment `anonymous-agent`), so a fresh `convex dev` reuses it and does not loop. If the local DB is ever reset and the loop returns, stop `convex dev`, move `packages/convex/.convex/local/default/*` to `~/.convex/anonymous-convex-backend-state/anonymous-agent/`, delete `packages/convex/.convex`, then restart.

Web: run `bun run dev` in `packages/web`, but you MUST override the injected cloud Convex URLs with the local ones in that shell — Bun's `--env-file` does not override variables already present in the process env (the injected secrets), so without this every page 500s with `Could not find public function for 'auth:get'`:

```
cd packages/web
env NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210 \
  NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:3211 \
  bun run dev
```

(The injected `BETTER_AUTH_URL` already points at the local web origin, so `APP_URL` resolves correctly without an override; only the cloud Convex URLs must be replaced with the local ones.)

Browser gotcha (must use the `localhost` hostname, not `127.0.0.1`): open the app via the `localhost` host on port 3000, NOT via the `127.0.0.1` host. Next.js 16 dev blocks cross-origin `/_next/*` dev resources; via the `127.0.0.1` host it treats them as cross-origin, the client runtime fails to load, and the page never hydrates. Symptom: pages render (SSR) but are dead — the public form's Submit button stays disabled and client mutations silently do nothing (no error). The `localhost` host is same-origin and hydrates normally.

Auth is Google/Microsoft OAuth only — there is no password login, so the authenticated dashboard cannot be reached headlessly. The anonymous public form flow (`/f/<slug>`) exercises core functionality (render published form → submit → stored in `submissions`) without auth. There is no seed/creation path without auth, so seeding a published form requires a temporary `internalMutation` (insert `workspaces` + `forms` with `status: "open"` + a `formSchemas` row with `status: "published"`, then set `forms.publishedSchemaId`), run via `convex run`. The snapshot's local DB already contains a published demo form at `/f/hello-world-demo` for quick verification.

## Philosophy

We have a few philosophies we should always honor:

### Performance above all else

When in doubt, do the thing that makes the app feel the fastest to use.

- Optimistic updates
- Avoiding waterfalls
- etc.

### Good defaults

Users should expect things to behave well by default. Less config is best.

### Convenience

We should not compromise on simplicity and good ux. We want to be pleasant to use with as little friction as possible.

- Less clicks to get to where you want to go
- Minimize blocking states to let users perform actions asap

### Security

We want to make things convenient, but we don't want to be insecure. Be thoughtful about how things are implemented.

## Design Language

The best of two worlds conveyed with two distinct stlyes. An interface that feels **percise** without being cold, and **approachable** without being generic.

- **Technical:** Monospace typography, uppercase tracking, sharp edges, information density, percision and performance.
- **Modern:** Rounded interactive elements, generous whitespace, soft palette, comfort and ease of use for non-technical users.

### Typography

- **Headings**: font display (Manrope) bold, tight tracking
- **Body**: font default (Inter), regular weight, clean and readable
- **Monospace**: font mono (Geist Mono), extra small, uppercase, tracking wide. For technical information, stats, and metadata.

### Borders

- Strong contrasting borders
- Sharp corners for informational and decorative elements (badges, status labels, empty state icons, metrics, etc.)
- Rounded corners for interactive and container elements (buttons, inputs, cards, dialogs, dropdowns, avatars, etc.)
- Never use sharp corners on something the user clicks. Never round an element that just displays information.

### Spacing

- Clear visual hierarchy through spacing
- Generous padding (p-6 to p-8 typical)
- Tight spacing for dense information (gap-4)
- Consistent vertical rhythm (space-y-4)

### Forms

- Colors should be neutral and standard, leveraging browser defaults.
- We explicitly want to opt out of the default color palette and use the "best practices for webforms".
- Forms should feel native on any website. No brand colors, no custom accents.
