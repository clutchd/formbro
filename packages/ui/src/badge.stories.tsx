import React from "react";
import { Badge } from "./badge";

const docs = `### Overview
Badge displays short labels, statuses, and metadata.

Use it for compact UI states like plan, environment, or record status.

### API
- Optional: \`variant\` for visual style.
- Optional: \`status\` for semantic state colors.
- Optional: \`asChild\` to render through a different element.

### Variants and states
- \`default\`, \`outline\`, and \`destructive\`.
- \`success\`, \`warning\`, \`error\`, \`info\`, and \`neutral\` status styles.

### Accessibility
- Keep badge text short and meaningful.
- Use semantic text, not color alone, to communicate state.

### Theming/tokens
- Uses shared foreground, border, accent, and status color tokens.
`;

export default {
  title: "UI/Badge",
  id: "ui-badge",
  component: Badge,
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
    children: "Pro",
    variant: "default",
    status: "none",
  },
};

export const Outline = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const Statuses = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge status="success">Success</Badge>
      <Badge status="warning">Warning</Badge>
      <Badge status="error">Error</Badge>
      <Badge status="info">Info</Badge>
      <Badge status="neutral">Neutral</Badge>
    </div>
  ),
};
