---
name: Launch Gap Plan
overview: "Launch punch list for the new FormBro repo, focused only on the missing product loop: public form, draft/publish, inline editor, AI assist, landing, and smoke testing."
todos:
  - id: public-form
    content: Finish public form rendering and safe submissions.
    status: completed
  - id: draft-publish
    content: Add draft load/save/publish lifecycle.
    status: completed
  - id: editor
    content: Build the inline registry-driven editor.
    status: completed
  - id: ai-generation
    content: Add non-intrusive AI build/refine workflow.
    status: completed
  - id: landing
    content: Finalize landing after the product loop works.
    status: completed
  - id: observability
    content: Verify PostHog, Sentry, and AI trace analytics before launch.
    status: pending
  - id: memberships
    content: Add basic multi-member workspace support.
    status: pending
  - id: smoke-deploy
    content: Smoke test and document deploy env.
    status: pending
isProject: false
---

# Launch Punch List

## Direction

- Do not port the old sidebar drag/drop builder. The new editor is inline, Tally/Typeform-style: click a `+` between elements, open a polished element picker, insert there.
- Use the existing schema/registry packages as the source of truth. The web editor should not hardcode per-element rendering when the registry/runtime already knows what exists.
- Reordering can be drag/drop within the editor canvas, but adding elements should happen inline through the picker.
- Treat current uncommitted files as WIP only. Keep what works, but finish the product loop cleanly.

## P0: Product Loop

1. ~~Public form works.~~
   - Finish [`packages/web/app/f/[form]/public-form.tsx`](packages/web/app/f/[form]/public-form.tsx).
   - Support not found, draft/coming soon, closed, invalid schema, submit error, and success states.
   - Harden [`packages/convex/submissions.ts`](packages/convex/submissions.ts): schema must be published, belong to the form, and the form must be open.

2. ~~Draft and publish lifecycle works.~~
   - Add `getDraft`, `saveDraft`, and `publish` in [`packages/convex/forms.ts`](packages/convex/forms.ts).
   - Draft edits save to `formSchemas`.
   - Publish validates the draft, creates/updates the published schema, sets `publishedSchemaId`, and opens a draft form.
   - Return `hasUnpublishedChanges` for the editor badge.

3. ~~Inline editor replaces the placeholder.~~
   - Replace [`packages/web/app/(app)/dashboard/[workspace]/[form]/page.tsx`](<packages/web/app/(app)/dashboard/[workspace]/[form]/page.tsx>) with the real editor.
   - Editor must load draft, autosave, publish, preview, edit title, add elements inline, edit elements, delete elements, and reorder elements.
   - Element picker should be registry-driven and searchable, with grouped sections like Questions, Text/Layout, Choice, Contact, etc.
   - Minimum launch element support should come from the existing registry/runtime, not custom one-off web components.
   - Follow-up polish: WYSIWYG deselected state, selected blocks replace preview with a cohesive editor panel, hover-only controls, property-driven element settings, type transforms, clearer page break labels, compact editor header badges, and `@dnd-kit` sortable reordering.
   - Current refinement: key editing is hidden for launch, selected editor panels use one card, type transforms use registry icons, and Options is driven by supported validation rules.
   - Current refinement: submit button is a fixed bottom editor item, field type icons render cleanly, Options rows are flattened, and multipage progress spacing is loosened.
   - Current refinement: unpublished changes is a clickable Changes badge with a confirmation flow to reset the draft back to the published schema.

## P1: AI Assist

4. ~~Add AI build/refine after draft/publish is stable.~~
   - Authenticated route verifies form access and uses the current draft as context.
   - AI returns a valid `FormInput` and saves through `saveDraft`.
   - UX should be a hybrid of Typeform and Tally: lightweight floating prompt or compact panel, no full-screen takeover, clear “what changed” summary, and easy undo/revert.
   - V1 scope: create a new draft and refine the current draft. Template scraping/import waits.
   - Current refinement: editor header has an Ask AI entry point, the right sidebar streams chat responses, renders tool calls as draft-change summaries, supports undo per applied AI change, captures thumbs up/down feedback, and saves generated schemas through the authenticated draft mutation.
   - Current refinement: AI execution now runs through a Convex HTTP action instead of a Next/Vercel route; the sidebar keeps chat state ephemeral while Convex streams the AI SDK response and saves generated schemas through `saveDraft`.

## P1: Launch Polish

5. ~~Finish landing page.~~
   - Keep the current landing WIP only if it supports the launch story; the current demo is too cramped.
   - Hero needs a clear AI value prop: generate and preview a real form directly on the homepage.
   - Demo should be full-width under the headline/CTA, similar in placement to Tally's homepage, but as a live editor plus preview instead of a video.
   - Reuse the real editor surface: edit-only, preview-only, or split editor/preview should be available in the app editor too.
   - Include prebuilt form presets users can click through, plus a controlled AI prompt for dynamic generation.
   - Protect homepage AI spend with sensible limits: lightweight model, rate limits, auth/turnstile if needed, capped prompt size, and fallback presets.
   - Current refinement: demo now sits full-width under the hero, homepage language is less developer-focused, external integrations are marked as coming soon, and the footer includes Clutchd, LLC, GitHub, and theme controls.

6. Verify existing dashboard views against the new lifecycle.
   - Share page shows the right public URL and draft/open/closed state.
   - Settings close/delete still works.
   - Submissions page is already the new source of truth; only fix issues found during smoke testing.

## P0: Observability

7. Verify product analytics, error tracking, and AI trace visibility.
   - Confirm PostHog is initialized correctly in the web app and key product events are captured.
   - Confirm Sentry captures client-side Next.js errors and server route errors.
   - Confirm Convex backend errors are captured or forwarded somewhere visible before launch.
   - Confirm AI chat requests create usable LLM traces in PostHog, including prompt/model/token/cost metadata where available.
   - Link thumbs up/down AI feedback events to the matching AI conversation/trace id.
   - Decide whether AI trace ids also need to be stored in Convex for later support/debug views; launch can rely on PostHog if correlation is solid.

## P0: Memberships

8. Add basic workspace membership management.
   - Workspaces have one owner and many members.
   - Owners and members can access workspace forms, submissions, sharing, and settings.
   - Billing management remains owner-only.
   - Launch can defer transfer ownership, but track it as a post-launch todo.

## Final Smoke Test

Run this exact path before launch:

1. Sign up/sign in.
2. Create workspace.
3. Create form.
4. Add/edit/reorder elements.
5. Autosave draft.
6. Publish.
7. Open public URL.
8. Submit response.
9. View response in submissions.
10. Close form and confirm public submissions are blocked.

## Later

- Template scraping/import.
- Dynamic OG image route.
- Advanced editor niceties beyond launch.
- Transfer workspace ownership.
