import React from "react";
import { Badge } from "./badge";
import { Card } from "./card";
import { TypographyH2, TypographyP } from "./typography";

const docs = `### Overview
Card groups related content into a reusable container.

Use it for repeated records, settings clusters, and compact workflow summaries.

### API
- Standard div attributes like \`className\` are supported.
- Compose headings, copy, actions, and metadata inside the card.

### Usage
- Keep nested content structured and scannable.
- Avoid placing cards inside cards.
- Prefer tight metadata and generous outer padding.

### Theming/tokens
- Uses shared card, border, and foreground tokens.
- Rounded corners match the app container language.
`;

export default {
  title: "UI/Card",
  id: "ui-card",
  component: Card,
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
  render: () => (
    <Card className="w-full max-w-sm gap-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <TypographyH2>Intake workflow</TypographyH2>
          <TypographyP className="text-sm text-muted-foreground">
            Collect, qualify, and route new leads.
          </TypographyP>
        </div>
        <Badge status="success">Live</Badge>
      </div>
    </Card>
  ),
};
