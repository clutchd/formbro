# @formbro/react

Early alpha React renderer and hooks for FormBro forms.

`@formbro/react` adapts `@formbro/core` schemas to React. It compiles a `FormInput`, wires TanStack Form validators and listeners, and renders the built-in FormBro fields with neutral native controls that can be styled by host applications.

## Alpha Status

This package is in early alpha. The schema, renderer, registry, and UI package boundaries may change before a stable `1.0.0` release.

## Install

```sh
npm install @formbro/react @formbro/core react react-dom
```

## Quick Start

```tsx
import { Form } from "@formbro/react";
import type { FormInput } from "@formbro/core/schema/form";

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

export function ContactForm() {
  return (
    <Form
      schema={schema}
      action={async ({ values }) => {
        console.log(values.email);
        return { ok: true, data: undefined };
      }}
    />
  );
}
```

## Public API

- `@formbro/react` - root exports for `Form`, `useForm`, built-in registries, and common components.
- `@formbro/react/components/form` - `Form` and `FormProps`.
- `@formbro/react/hooks/use-form` - headless React form hook.
- `@formbro/react/registry` - built-in React field and element component registries.

The FormBro product builder/editor lives in the web app package. The public React package is the runtime renderer and hook surface.

## Development

```sh
bun run build
bun test
```

## License

MIT
