import {
  RiArchiveLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiMore2Line,
  RiSettings3Line,
} from "@remixicon/react";
import React from "react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const docs = `### Overview
Dropdown Menu exposes contextual actions without leaving the current workflow.

Use it for secondary actions, view options, and compact record controls.

### API
- Compose with \`DropdownMenuTrigger\`, \`DropdownMenuContent\`, and item primitives.
- Supports standard Radix menu props including controlled open state.
- Includes checkbox, radio, separator, shortcut, and submenu primitives.

### Accessibility
- Use icon triggers with a visible or screen-reader label.
- Keep destructive items clearly labelled and visually distinct.
- Prefer menu items for commands, not navigation-only destinations.

### Theming/tokens
- Uses popover, border, accent, destructive, and ring tokens.
- Interactive menu rows use rounded corners.
`;

export default {
  title: "UI/Dropdown Menu",
  id: "ui-dropdown-menu",
  component: DropdownMenu,
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
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <RiMore2Line />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>Form actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <RiFileCopyLine />
          Duplicate
          <DropdownMenuShortcut>Cmd+D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <RiArchiveLine />
          Archive
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          <RiDeleteBinLine />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const IconTrigger = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open form actions">
          <RiMore2Line />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Share</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const CheckboxItems = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Table columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Responses</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked>Completion rate</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Owner</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const RadioItems = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Sort Forms</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value="recent">
          <DropdownMenuRadioItem value="recent">Recently updated</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="responses">Responses</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const SubMenu = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <RiSettings3Line />
          Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              <DropdownMenuItem>Sales</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuItem>Operations</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
