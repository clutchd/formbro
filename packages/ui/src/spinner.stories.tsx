import React from "react";
import { Button } from "./button";
import { Spinner } from "./spinner";

const docs = `### Overview
Spinner indicates a short loading state.

Use it where work has started and the interface needs lightweight progress feedback.

### API
- Optional: \`className\` for size and color adjustments.
- Standard Remix icon SVG props are supported.

### Accessibility
- The icon has \`role="status"\` and an accessible loading label.
- Pair with visible loading text when the state blocks a user action.
- Prefer keeping buttons enabled until the request actually starts.

### Theming/tokens
- Inherits current text color.
- Uses transform animation for inexpensive motion.
`;

export default {
  title: "UI/Spinner",
  id: "ui-spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: docs,
      },
    },
  },
};

export const Basic = {
  render: () => <Spinner />,
};

export const InButton = {
  render: () => (
    <Button disabled>
      <Spinner />
      Saving
    </Button>
  ),
};
