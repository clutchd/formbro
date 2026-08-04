# @formbro/embed-react

Render a published FormBro form as native React DOM. The host application owns the page, layout,
fonts, and deployment; FormBro owns the published schema and response workflow.

## Next.js App Router

Import the small neutral stylesheet once, then render the Server Component:

```tsx
import "@formbro/embed-react/styles.css";
import { FormBroForm } from "@formbro/embed-react/next";

export default function CareersPage() {
  return <FormBroForm publicId="your-public-form-id" revalidate={60} />;
}
```

The published snapshot is fetched during server rendering and revalidated in the Next.js Data
Cache. The initial response contains form markup; publishing a new FormBro revision updates the host
page without a rebuild or snippet change.

Self-hosted FormBro installations should pass their public API origin with `apiUrl`.

## React

Use `fetchPublishedFormSnapshot` in your framework's loader, then pass the result to `NativeForm`:

```tsx
import { NativeForm, fetchPublishedFormSnapshot } from "@formbro/embed-react";
import "@formbro/embed-react/styles.css";

const result = await fetchPublishedFormSnapshot({
  apiUrl: "https://formbro.com",
  publicId: "your-public-form-id",
});

if (result.ok) {
  return <NativeForm apiUrl="https://formbro.com" snapshot={result.snapshot} />;
}
```

The stylesheet uses neutral native controls and inherited typography. Override its
`[data-formbro-native]` selectors in the host stylesheet when tighter visual integration is needed.
