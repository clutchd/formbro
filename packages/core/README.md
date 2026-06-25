# @formbro/core

Framework-agnostic form schema and compile pipeline for FormBro.

`@formbro/core` owns the durable form contract: form schemas, built-in field and element registries, schema validation, and compilation into runtime-ready form data. Rendering belongs in framework adapters such as `@formbro/react`.

## Alpha Status

This package is in early alpha. The schema and adapter APIs may change before a stable `1.0.0` release.

## Install

```sh
npm install @formbro/core zod
```

`zod` is a peer dependency because core exposes Zod schemas as part of its public API.

## Quick Start

```ts
import { compile, type FormInput, type FormValues } from "@formbro/core";

const schema = {
  id: "contact_form",
  name: "Contact Form",
  elements: [
    {
      id: "email",
      name: "Email",
      type: "email",
      label: true,
      rules: [{ type: "required", value: true }],
    },
  ],
} as const satisfies FormInput;

const form = compile(schema);
type Values = FormValues<typeof schema>;
```

Compiled output includes defaults, pages, sections, validator plans, listeners, and submit metadata keyed by stable field IDs.

## Stable IDs

Every form and element has an explicit `id`. IDs are stable identity and must not be derived from mutable display properties such as `name`, `label`, placeholder text, or variable interpolation.

Use stable semantic IDs for hand-authored schemas:

```ts
{ id: "email", name: "Work Email", type: "email" }
```

Future builders should assign an ID once when an element is created and persist it with the schema.

## Public API

- `@formbro/core/compile` - `compile()`, compiled form types, and compiler output types.
- `@formbro/core/registry` - built-in field and element registry metadata.
- `@formbro/core/validation` - synchronous validator builders and submission validation.
- `@formbro/core/schema/form` - `FormSchema`, `FormInput`, `FormValues`, and form action types.
- `@formbro/core/schema/*` - supporting Zod schemas and schema-derived types.

## Development

```sh
bun test
bun run build
```

## License

MIT
