import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const docs = `### Overview
Avatar represents a person, team, or workspace in compact navigation and record surfaces.

Use it for identity markers where the fallback initials still communicate the entity.

### API
- Compose with \`AvatarImage\` and \`AvatarFallback\`.
- Optional: set \`data-size\` to \`sm\`, default, or \`lg\` for supported size tokens.
- Standard Radix avatar root and image attributes are supported.

### Accessibility
- Provide meaningful \`alt\` text for real user or workspace images.
- Use \`alt=""\` when the visible adjacent text already names the entity.
- Keep fallback text short, usually 1-2 initials.

### Theming/tokens
- Uses muted surface and foreground tokens for fallbacks.
- Avatars stay rounded to match the product guide.
`;

export default {
  title: "UI/Avatar",
  id: "ui-avatar",
  component: Avatar,
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
    <Avatar>
      <AvatarImage src="https://github.com/crutchtheclutch.png" alt="William Crutchfield" />
      <AvatarFallback>WC</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback = {
  render: () => (
    <Avatar>
      <AvatarFallback>WC</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar data-size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar data-size="lg">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  ),
};
