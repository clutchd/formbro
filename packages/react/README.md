# @formbro/react

Early alpha React renderer and hooks for FormBro forms.

`@formbro/react` adapts `@formbro/core` schemas to React UI. It compiles a `FormInput`, wires TanStack Form validators and listeners, and currently renders the built-in FormBro fields through the internal `@formbro/ui` package.

## Alpha Status

This package is in early alpha. The schema, renderer, registry, and UI package boundaries may change before a stable `1.0.0` release.

## Current Status

This package is not yet the final public renderer boundary. The intended direction is to separate the React renderer from the FormBro-designed UI components so `@formbro/react` can be published without depending on internal SaaS UI primitives.

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

## Development

```sh
bun test
```

## License

MIT
