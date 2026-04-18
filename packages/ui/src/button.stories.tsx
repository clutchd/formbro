import React from "react";
import { Button } from "./button";

const docs = `### Overview
Button triggers actions and navigation affordances across the app.

Use it for primary actions, secondary actions, and inline link-style actions.

### API
- Optional: \`variant\` for visual style.
- Optional: \`size\` for control height and padding.
- Optional: \`asChild\` to render through a different element.
- Standard button attributes like \`disabled\` are supported.

### Variants
- \`default\`, \`destructive\`, \`outline\`, and \`link\`.

### Sizes
- \`sm\`, \`default\`, \`lg\`, and \`icon\`.

### Accessibility
- Use meaningful button text that clearly describes the action.
- Prefer icon buttons only when an accessible label is provided.
`;

export default {
  title: "UI/Button",
  id: "ui-button",
  component: Button,
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
  args: {
    children: "Default",
    variant: "default",
    size: "default",
  },
};

export const Variants = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Icon button">
        ?
      </Button>
    </div>
  ),
};

export const States = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Enabled</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
};
