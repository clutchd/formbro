import React from "react";
import { Field, FieldContent, FieldDescription, FieldLabel } from "./field";
import { Switch } from "./switch";

const docs = `### Overview
Switch toggles a binary setting.

Use it for immediate on/off preferences that do not require a separate save choice.

### API
- Supports controlled and uncontrolled Radix switch props.
- Use \`checked\`, \`defaultChecked\`, and \`onCheckedChange\` for state.
- Standard button attributes like \`disabled\` are supported.

### Accessibility
- Pair switches with visible labels whenever possible.
- Use \`aria-label\` only when visible context already names the setting.
- Add descriptions for settings with operational impact.

### Theming/tokens
- Uses primary, input, background, foreground, and ring tokens.
- Rounded geometry communicates an interactive toggle.
`;

export default {
  title: "UI/Switch",
  id: "ui-switch",
  component: Switch,
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
    <Field orientation="horizontal">
      <Switch id="switch-basic" defaultChecked />
      <FieldLabel htmlFor="switch-basic">Accept responses</FieldLabel>
    </Field>
  ),
};

export const States = {
  render: () => (
    <div className="grid gap-4">
      <Field orientation="horizontal">
        <Switch id="switch-on" defaultChecked />
        <FieldLabel htmlFor="switch-on">Enabled</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Switch id="switch-off" />
        <FieldLabel htmlFor="switch-off">Disabled</FieldLabel>
      </Field>
      <Field orientation="horizontal" data-disabled="true">
        <Switch id="switch-disabled" disabled />
        <FieldLabel htmlFor="switch-disabled">Unavailable</FieldLabel>
      </Field>
    </div>
  ),
};

export const WithDescription = {
  render: () => (
    <Field className="w-full max-w-lg" orientation="horizontal">
      <Switch id="switch-private" aria-describedby="switch-private-copy" />
      <FieldContent>
        <FieldLabel htmlFor="switch-private">Private form</FieldLabel>
        <FieldDescription id="switch-private-copy">
          Restrict the form to authenticated workspace members.
        </FieldDescription>
      </FieldContent>
    </Field>
  ),
};
