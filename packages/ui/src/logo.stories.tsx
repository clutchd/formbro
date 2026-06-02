import React from "react";
import { Logo } from "./logo";

const docs = `### Overview
Logo renders the FormBro wordmark in the display typeface.

Use it in navigation, authentication screens, and branded headers.

### API
- Optional: \`className\` for size, color, and layout adjustments.
- The component renders text, so it inherits foreground color by default.

### Accessibility
- Treat it as visible text when it names the product.
- Add surrounding landmark or heading semantics where the layout requires them.

### Theming/tokens
- Uses the display font and tight tracking defined in typography tokens.
`;

export default {
  title: "UI/Logo",
  id: "ui-logo",
  component: Logo,
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
  render: () => <Logo />,
};
