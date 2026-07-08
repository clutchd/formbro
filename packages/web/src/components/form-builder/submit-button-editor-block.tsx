"use client";

import type { FormInput } from "@formbro/core/schema/form";
import { twx } from "@formbro/shared/twx";
import { Button } from "@formbro/ui/button";
import { Input } from "@formbro/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@formbro/ui/select";
import { RiCloseLine, RiSendPlaneLine } from "@remixicon/react";
import { useState } from "react";
import {
  handleKeyboardSelect,
  submitEditorId,
  submitLabel,
  type SubmitConfig,
} from "./canvas-utils";
import { EditorPanelTabs } from "./editor";

export function SubmitButtonEditorBlock({
  density = "default",
  onDeselect,
  onSelect,
  onUpdate,
  selected,
  submit,
}: {
  density?: "compact" | "default";
  onDeselect: () => void;
  onSelect: () => void;
  onUpdate: (updater: (submit: SubmitConfig) => SubmitConfig) => void;
  selected: boolean;
  submit?: FormInput["submit"];
}) {
  const [activeTab, setActiveTab] = useState<"edit" | "options">("edit");
  const label = submitLabel(submit);
  const size = submit?.size ?? "default";
  const variant = submit?.variant ?? "default";

  return (
    <section
      data-editor-row={submitEditorId}
      className={twx(
        "group/editor relative w-full px-3 sm:px-6",
        density === "compact" ? "py-0.5" : "py-1",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onKeyDown={(event) => handleKeyboardSelect(event, onSelect)}
      role="button"
      tabIndex={0}
    >
      <div className="mx-auto grid w-full max-w-[52rem] grid-cols-[2.25rem_minmax(0,48rem)] gap-2">
        <div aria-hidden />
        <div
          className={twx(
            "min-w-0 rounded-lg border border-transparent bg-background transition-[background-color,border-color,box-shadow]",
            selected ? "px-0 py-0" : density === "compact" ? "px-3 py-2" : "px-4 py-4",
            !selected && "group-focus-within/editor:bg-muted/25 group-hover/editor:bg-muted/25",
          )}
        >
          {selected ? (
            <div
              data-editor-settings
              className="overflow-hidden rounded-lg border bg-card shadow-sm"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/20 px-3 py-2">
                <EditorPanelTabs
                  activeTab={activeTab}
                  hasOptions
                  onEdit={() => setActiveTab("edit")}
                  onOptions={() => setActiveTab("options")}
                />
                <div className="flex items-center gap-2">
                  <div className="flex h-8 items-center gap-2 rounded-md border bg-background px-3 text-sm">
                    <span className="flex size-5 items-center justify-center border bg-muted text-muted-foreground">
                      <RiSendPlaneLine className="size-3.5" />
                    </span>
                    Submit button
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="size-8 rounded-full border bg-background p-0"
                    aria-label="Deselect submit button"
                    onClick={onDeselect}
                  >
                    <RiCloseLine className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                {activeTab === "edit" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="form-submit-label">
                      Button text
                    </label>
                    <Input
                      id="form-submit-label"
                      value={submit?.label ?? ""}
                      onChange={(event) =>
                        onUpdate((current) => ({
                          ...current,
                          label: event.target.value || undefined,
                        }))
                      }
                      placeholder="Submit"
                    />
                  </div>
                ) : (
                  <div className="-m-3 divide-y">
                    <div className="grid gap-3 px-3 py-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="form-submit-size">
                          Button width
                        </label>
                        <Select
                          value={size}
                          onValueChange={(value) =>
                            onUpdate((current) => ({
                              ...current,
                              size: value as SubmitConfig["size"],
                            }))
                          }
                        >
                          <SelectTrigger id="form-submit-size" className="w-full bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="full-width">Full width</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="form-submit-variant">
                          Button style
                        </label>
                        <Select
                          value={variant}
                          onValueChange={(value) =>
                            onUpdate((current) => ({
                              ...current,
                              variant: value as SubmitConfig["variant"],
                            }))
                          }
                        >
                          <SelectTrigger id="form-submit-variant" className="w-full bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Primary</SelectItem>
                            <SelectItem value="destructive">Destructive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={twx(density === "compact" ? "space-y-1.5" : "space-y-2")}>
              <div className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                <RiSendPlaneLine className="size-4" />
                Submit button
              </div>
              <div
                className={twx("flex", size === "full-width" ? "justify-stretch" : "justify-end")}
              >
                <Button
                  type="button"
                  variant={submit?.variant}
                  size={density === "compact" ? "dense" : "default"}
                  className={twx(
                    "pointer-events-none font-semibold",
                    size === "full-width" ? "w-full" : "min-w-[120px]",
                  )}
                >
                  {label}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
