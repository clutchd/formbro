import React from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const docs = `### Overview
Dialog presents focused tasks and confirmation flows above the current page.

Use it when the user needs to make a deliberate decision without losing context.

### API
- Compose with \`DialogTrigger\`, \`DialogContent\`, \`DialogHeader\`, and \`DialogFooter\`.
- Optional: \`showCloseButton\` on \`DialogContent\`.
- Supports controlled and uncontrolled Radix dialog props.

### Accessibility
- Always include \`DialogTitle\`.
- Use \`DialogDescription\` for the decision context or next step.
- Keep destructive actions explicit and paired with a cancel option.

### Theming/tokens
- Uses background, border, foreground, and ring tokens.
- Interactive close controls stay rounded.
`;

export default {
  title: "UI/Dialog",
  id: "ui-dialog",
  component: Dialog,
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
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite teammate</DialogTitle>
          <DialogDescription>
            Send an invitation to collaborate on this workspace.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Send Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Open = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workspace ready</DialogTitle>
          <DialogDescription>
            Your form defaults have been applied and the workflow is ready to edit.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Continue</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DestructiveConfirmation = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Form</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Form?</DialogTitle>
          <DialogDescription>
            This removes the form from the workspace. Export responses before deleting.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Delete Form</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithoutCloseButton = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Required Step</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Finish setup</DialogTitle>
          <DialogDescription>Choose a workspace before creating your first form.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Choose Workspace</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
