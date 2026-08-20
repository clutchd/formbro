"use client";

import { Registry, type RegistryItem, type RegistryKey } from "@formbro/core/registry";
import { twx } from "@formbro/shared/twx";
import { Button } from "@formbro/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@formbro/ui/dialog";
import { Input } from "@formbro/ui/input";
import { RiAddLine, RiSearchLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import { getRegistryVisual } from "../registry";

const pickerGroups: Array<{ label: string; keys: RegistryKey[] }> = [
  { label: "Questions", keys: ["short_text", "long_text", "number", "date"] },
  { label: "Choice", keys: ["single_select", "multi_select", "radio_group"] },
  { label: "Contact", keys: ["email", "phone", "link"] },
  { label: "Text/Layout", keys: ["heading", "description", "divider", "page_break"] },
];

function getRegistryItem(type: RegistryKey) {
  return Registry[type];
}

export function ElementPicker({
  onSelect,
  trigger,
}: {
  onSelect: (type: RegistryKey) => void;
  trigger: "compact" | "empty";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const matchingGroups: Array<{
      items: RegistryItem[];
      keys: RegistryKey[];
      label: string;
    }> = [];

    for (const group of pickerGroups) {
      const items: RegistryItem[] = [];

      for (const key of group.keys) {
        const item = getRegistryItem(key);
        if (
          normalizedQuery &&
          !`${item.display} ${item.description} ${item.key}`.toLowerCase().includes(normalizedQuery)
        ) {
          continue;
        }

        items.push(item);
      }

      if (items.length > 0) {
        matchingGroups.push({ ...group, items });
      }
    }

    return matchingGroups;
  }, [normalizedQuery]);

  const select = (type: RegistryKey) => {
    onSelect(type);
    setQuery("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={trigger === "empty" ? "default" : "outline"}
          size={trigger === "empty" ? "dense" : "sm"}
          className={twx(
            trigger === "compact" && "size-7 rounded-full border-0 bg-transparent p-0",
            trigger === "empty" && "rounded-full",
          )}
          aria-label="Add form element"
          onClick={(event) => event.stopPropagation()}
        >
          <RiAddLine className="size-4" />
          {trigger === "empty" ? <span>Add element</span> : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[min(42rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b px-5 pt-5 pb-4">
          <DialogTitle>Add element</DialogTitle>
          <DialogDescription>Questions, content, and page breaks for this draft.</DialogDescription>
        </DialogHeader>
        <div className="shrink-0 border-b px-5 py-4">
          <div className="relative">
            <RiSearchLine className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search elements"
              className="pl-9"
              autoFocus
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {groups.length === 0 ? (
            <div className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No elements match that search.
            </div>
          ) : null}
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.label}>
                <h3 className="mb-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                  {group.label}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <PickerItem key={item.key} item={item} onSelect={select} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PickerItem({
  item,
  onSelect,
}: {
  item: RegistryItem;
  onSelect: (type: RegistryKey) => void;
}) {
  const visual = getRegistryVisual(item.key);
  const Icon = visual?.icon;

  return (
    <button
      type="button"
      className="flex min-h-20 w-full items-start gap-3 rounded-lg border bg-background p-3 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      onClick={() => onSelect(item.key)}
    >
      <span
        className={twx(
          "flex size-9 shrink-0 items-center justify-center border",
          visual?.color ?? "bg-muted text-muted-foreground",
        )}
      >
        {Icon ? <Icon className="size-4" /> : <RiAddLine className="size-4" />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{item.display}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </span>
      </span>
    </button>
  );
}
