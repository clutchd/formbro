import { RiAddLine, RiFileAiLine, RiSearchLine, RiUploadCloudLine } from "@remixicon/react";
import React from "react";
import { Button } from "./button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";

const docs = `### Overview
Empty communicates that a surface has no data yet and gives the user a next step.

Use it for zero states, filtered-out lists, and import/setup flows.

### API
- Compose with \`EmptyHeader\`, \`EmptyMedia\`, \`EmptyTitle\`, \`EmptyDescription\`, and \`EmptyContent\`.
- Optional: \`variant="icon"\` on \`EmptyMedia\` for dashed icon treatments.
- Standard div attributes like \`className\` are supported.

### Accessibility
- Keep the title specific.
- Use action-oriented copy that tells users how to recover or proceed.
- Decorative icons should be hidden from assistive technology.

### Theming/tokens
- Uses muted foreground and border tokens.
- Empty media is sharp to match informational icon guidance.
`;

export default {
  title: "UI/Empty",
  id: "ui-empty",
  component: Empty,
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
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiFileAiLine />
        </EmptyMedia>
        <EmptyTitle>No forms yet</EmptyTitle>
        <EmptyDescription>Create your first form to start collecting data</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>
          <RiAddLine /> Create Form
        </Button>
      </EmptyContent>
    </Empty>
  ),
};
