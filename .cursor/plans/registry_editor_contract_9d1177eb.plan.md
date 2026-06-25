---
name: registry editor contract
overview: Move editor behavior out of individual React element modules and into core registry metadata. React will render editor controls from core descriptors instead of per-element editor functions deciding which fields are editable.
todos:
  - id: schema
    content: Define editor metadata schema in core registry types
    status: completed
  - id: metadata
    content: Populate editor metadata for all registry items
    status: completed
  - id: renderer
    content: Refactor React editor to render from metadata descriptors
    status: completed
  - id: cleanup
    content: Remove per-component editor layout/control decisions
    status: completed
  - id: validate
    content: Run focused diagnostics and typechecks
    status: completed
isProject: false
---

# Registry-Driven Editor Contract

## Direction

Use core registry metadata as the source of truth for what the editor shows. Keep core framework-agnostic by storing declarative control descriptors, not React components.

The shape should be roughly:

```ts
editor: {
  defaults: { ... },
  layout: { previewSpacing: "compact", previewAlign: "center" },
  preview: { control: "input" | "textarea" | "select" | "heading" | "description" | "divider" },
  properties: [
    { key: "label", label: "Question", control: "text", section: "content" },
    { key: "placeholder", label: "Placeholder", control: "text", section: "content" },
    { key: "required", label: "Required", control: "rule", section: "validation" }
  ]
}
```

## Implementation Plan

- Update `[packages/core/src/schema/registry.ts](packages/core/src/schema/registry.ts)` to rename `builder` to `editor` and add schemas for `defaults`, `layout`, `preview`, and `properties`.
- Populate `[packages/core/src/registry.ts](packages/core/src/registry.ts)` with explicit editor metadata for every registry item: defaults, layout, preview descriptor, and editable properties/rules.
- Update `[packages/core/src/schema/editor.ts](packages/core/src/schema/editor.ts)` so draft creation reads `item.editor?.defaults`, and add helper accessors for editor properties/layout/preview.
- Refactor `[packages/react/src/editor.tsx](packages/react/src/editor.tsx)` into a generic renderer that maps core control descriptors to React controls. This replaces the hardcoded `defaultFieldEditorProperties`, `choiceFieldEditorProperties`, and per-component property decisions.
- Simplify React element modules like `[packages/react/src/elements/heading.tsx](packages/react/src/elements/heading.tsx)` and `[packages/react/src/elements/description.tsx](packages/react/src/elements/description.tsx)` so they no longer export editor layout or editor control decisions. They should only keep runtime rendering and any visual adapter metadata like icon/color.
- Update `[packages/react/src/registry.ts](packages/react/src/registry.ts)` to read editor layout/preview from core registry metadata and keep React-only adapter lookup for icons and runtime components.
- Validate with focused typechecks for core and React, then run React Doctor changed-file diagnostics.

## Expected Outcome

Adding or changing editable fields becomes deterministic: update the core registry entry, and the editor UI follows. React remains responsible for rendering the generic controls, but not for deciding what is editable for each form element.
