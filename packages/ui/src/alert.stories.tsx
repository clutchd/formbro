import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const docs = `### Overview
Alert surfaces important contextual feedback inside the interface.

Use it for inline notices, warnings, and destructive state messaging.

### API
- Optional: \`variant\` for visual tone.
- Supports composed content through \`AlertTitle\` and \`AlertDescription\`.
- Standard div attributes like \`className\` are supported.

### Variants
- \`default\` for general messaging.
- \`success\` for completed or confirmed states.
- \`destructive\` for errors and critical issues.

### Accessibility
- The root uses \`role="alert"\` so assistive technology announces it.
- Keep titles short and descriptions action-oriented when possible.
`;

export default {
  title: "UI/Alert",
  id: "ui-alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
};

export const Default = {
  render: () => (
    <Alert className="max-w-md">
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
    </Alert>
  ),
};

export const Success = {
  render: () => (
    <Alert variant="success" className="max-w-md">
      <AlertTitle>Preview only</AlertTitle>
      <AlertDescription>Nothing was submitted.</AlertDescription>
    </Alert>
  ),
};

export const Destructive = {
  render: () => (
    <Alert variant="destructive" className="max-w-md">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
    </Alert>
  ),
};
