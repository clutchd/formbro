"use client";

import type { Id } from "@formbro/convex/_generated/dataModel";
import type { FormInput } from "@formbro/core/schema/form";
import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { twx } from "@formbro/shared/twx";
import { Badge, badgeVariants } from "@formbro/ui/badge";
import { Button } from "@formbro/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@formbro/ui/dialog";
import { RiArrowGoBackLine, RiBardLine, RiExternalLinkLine, RiRefreshLine } from "@remixicon/react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { toast } from "sonner";
import { FormAiSidebar } from "@/components/form-ai-sidebar";
import { FormBuilderCanvas } from "@/components/form-builder-canvas";
import { Loading } from "@/components/loading";
import { PageState } from "@/components/page-state";
import { useRequiredWorkspaceFormData } from "./_data-provider";

type SaveState = "idle" | "saving" | "saved" | "error";
type EditorState = {
  hasUnpublishedChanges: boolean;
  publishing: boolean;
  reverting: boolean;
  saveState: SaveState;
  schema: FormInput | null;
};
type EditorAction =
  | {
      hasUnpublishedChanges: boolean;
      schema: FormInput;
      type: "server-loaded";
    }
  | {
      type: "schema-updated";
      updater: (schema: FormInput) => FormInput;
    }
  | {
      saveState: SaveState;
      type: "save-state-changed";
    }
  | {
      hasUnpublishedChanges: boolean;
      type: "save-succeeded";
    }
  | {
      type: "publish-started";
    }
  | {
      schema: FormInput;
      type: "publish-succeeded";
    }
  | {
      type: "publish-finished";
    }
  | {
      type: "revert-started";
    }
  | {
      schema: FormInput;
      type: "revert-succeeded";
    }
  | {
      type: "revert-finished";
    };

const initialEditorState: EditorState = {
  hasUnpublishedChanges: false,
  publishing: false,
  reverting: false,
  saveState: "idle",
  schema: null,
};

function statusLabel(saveState: SaveState, hasUnpublishedChanges: boolean) {
  if (saveState === "saving") return "Saving";
  if (saveState === "error") return "Save failed";
  if (hasUnpublishedChanges) return "Changes";
  return "Published";
}

function statusTone(saveState: SaveState, hasUnpublishedChanges: boolean) {
  if (saveState === "error") return "error";
  if (saveState === "saving" || hasUnpublishedChanges) return "warning";
  return "success";
}

function serializeSchema(schema: FormInput) {
  return JSON.stringify(schema);
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "server-loaded":
      return {
        ...state,
        hasUnpublishedChanges: action.hasUnpublishedChanges,
        saveState: "saved",
        schema: action.schema,
      };
    case "schema-updated":
      if (!state.schema) return state;
      return {
        ...state,
        hasUnpublishedChanges: true,
        schema: action.updater(state.schema),
      };
    case "save-state-changed":
      return {
        ...state,
        saveState: action.saveState,
      };
    case "save-succeeded":
      return {
        ...state,
        hasUnpublishedChanges: action.hasUnpublishedChanges,
        saveState: "saved",
      };
    case "publish-started":
      return {
        ...state,
        publishing: true,
      };
    case "publish-succeeded":
      return {
        ...state,
        hasUnpublishedChanges: false,
        saveState: "saved",
        schema: action.schema,
      };
    case "publish-finished":
      return {
        ...state,
        publishing: false,
      };
    case "revert-started":
      return {
        ...state,
        reverting: true,
      };
    case "revert-succeeded":
      return {
        ...state,
        hasUnpublishedChanges: false,
        saveState: "saved",
        schema: action.schema,
      };
    case "revert-finished":
      return {
        ...state,
        reverting: false,
      };
  }
}

function DraftStatusBadge({
  canRevert,
  disabled,
  hasUnpublishedChanges,
  onConfirm,
  onOpenChange,
  open,
  reverting,
  saveState,
}: {
  canRevert: boolean;
  disabled: boolean;
  hasUnpublishedChanges: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  reverting: boolean;
  saveState: SaveState;
}) {
  const label = statusLabel(saveState, hasUnpublishedChanges);

  if (!hasUnpublishedChanges || saveState !== "saved" || !canRevert) {
    return <Badge status={statusTone(saveState, hasUnpublishedChanges)}>{label}</Badge>;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!reverting) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label="Reset unpublished changes"
          className={twx(
            badgeVariants({ status: "warning" }),
            "cursor-pointer transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-amber-400/25",
          )}
        >
          <RiArrowGoBackLine className="size-3" />
          {label}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset unpublished changes?</DialogTitle>
          <DialogDescription>
            This will replace your current draft with the last published version. The published form
            will not change.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={reverting}>
              Keep draft
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={reverting}>
            {reverting ? (
              <>
                <RiRefreshLine className="size-4 animate-spin" />
                Resetting
              </>
            ) : (
              "Reset to published"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function WorkspaceFormPage() {
  const { form } = useRequiredWorkspaceFormData();

  return <FormDraftEditor formId={form._id} formSlug={form.slug} />;
}

function FormDraftEditor({ formId, formSlug }: { formId: Id<"forms">; formSlug: string }) {
  const draft = useQuery(api.forms.getDraft, { formId });
  const revertDraft = useMutation(api.forms.revertDraft);
  const saveDraft = useMutation(api.forms.saveDraft);
  const publishForm = useMutation(api.forms.publish);
  const [{ hasUnpublishedChanges, publishing, reverting, saveState, schema }, dispatch] =
    useReducer(editorReducer, initialEditorState);
  const [aiOpen, setAiOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const schemaRef = useRef<FormInput | null>(null);
  const loadedFormId = useRef<string | null>(null);
  const lastSavedSerialized = useRef<string | null>(null);
  const lastServerSerialized = useRef<string | null>(null);
  const lastSubmittedSave = useRef<string | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const saveSequence = useRef(0);

  useEffect(() => {
    schemaRef.current = schema;
  }, [schema]);

  useEffect(() => {
    if (!draft?.ok) return;

    const serverSerialized = serializeSchema(draft.data.schema);
    const isFirstLoad = loadedFormId.current !== formId;
    const serverChanged = lastServerSerialized.current !== serverSerialized;

    if (!isFirstLoad && !serverChanged) return;

    loadedFormId.current = formId;
    lastServerSerialized.current = serverSerialized;
    lastSavedSerialized.current = serverSerialized;

    const localSerialized = schemaRef.current ? serializeSchema(schemaRef.current) : null;
    if (serverSerialized === lastSubmittedSave.current && localSerialized !== serverSerialized) {
      return;
    }

    dispatch({
      hasUnpublishedChanges: draft.data.hasUnpublishedChanges,
      schema: draft.data.schema,
      type: "server-loaded",
    });
  }, [draft, formId]);

  const updateSchema = useCallback((updater: (schema: FormInput) => FormInput) => {
    dispatch({ type: "schema-updated", updater });
  }, []);

  const applyAiSchema = useCallback(
    (nextSchema: FormInput) => {
      updateSchema(() => nextSchema);
    },
    [updateSchema],
  );

  useEffect(() => {
    if (!schema || loadedFormId.current !== formId) return;

    const serialized = serializeSchema(schema);
    if (serialized === lastSavedSerialized.current) return;

    const sequence = saveSequence.current + 1;
    saveSequence.current = sequence;
    dispatch({ saveState: "saving", type: "save-state-changed" });

    const timeout = window.setTimeout(() => {
      lastSubmittedSave.current = serialized;
      void saveDraft({ formId, schema })
        .then((result) => {
          if (sequence !== saveSequence.current) return;
          if (!result.ok) {
            dispatch({ saveState: "error", type: "save-state-changed" });
            toast.error("Draft save failed", {
              description: getErrorMessage(result.error),
            });
            return;
          }

          lastSavedSerialized.current = serialized;
          dispatch({
            hasUnpublishedChanges: result.data.hasUnpublishedChanges,
            type: "save-succeeded",
          });
        })
        .catch((error: unknown) => {
          if (sequence !== saveSequence.current) return;
          dispatch({ saveState: "error", type: "save-state-changed" });
          toast.error("Draft save failed", {
            description: getErrorMessage(error),
          });
        });
    }, 650);
    saveTimeoutRef.current = timeout;

    return () => {
      window.clearTimeout(timeout);
      if (saveTimeoutRef.current === timeout) {
        saveTimeoutRef.current = null;
      }
    };
  }, [formId, saveDraft, schema]);

  const publish = async () => {
    if (!schema) return;

    dispatch({ type: "publish-started" });
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    try {
      const saved = await saveDraft({ formId, schema });
      if (!saved.ok) {
        toast.error("Publish failed", {
          description: getErrorMessage(saved.error),
        });
        return;
      }

      const result = await publishForm({ formId });
      if (!result.ok) {
        toast.error("Publish failed", {
          description: getErrorMessage(result.error),
        });
        return;
      }

      const serialized = serializeSchema(result.data.schema);
      saveSequence.current += 1;
      lastSavedSerialized.current = serialized;
      lastServerSerialized.current = serialized;
      lastSubmittedSave.current = serialized;
      dispatch({ schema: result.data.schema, type: "publish-succeeded" });
      toast.success("Form published");
    } catch (error) {
      toast.error("Publish failed", {
        description: getErrorMessage(error),
      });
    } finally {
      dispatch({ type: "publish-finished" });
    }
  };

  const revertToPublished = async () => {
    if (!schema) return;

    dispatch({ type: "revert-started" });
    saveSequence.current += 1;
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    try {
      const result = await revertDraft({ formId });
      if (!result.ok) {
        toast.error("Could not reset draft", {
          description: getErrorMessage(result.error),
        });
        return;
      }

      const serialized = serializeSchema(result.data.schema);
      lastSavedSerialized.current = serialized;
      lastServerSerialized.current = serialized;
      lastSubmittedSave.current = serialized;
      dispatch({ schema: result.data.schema, type: "revert-succeeded" });
      setResetDialogOpen(false);
      toast.success("Draft reset to published version");
    } catch (error) {
      toast.error("Could not reset draft", {
        description: getErrorMessage(error),
      });
    } finally {
      dispatch({ type: "revert-finished" });
    }
  };

  if (draft === undefined || !schema) {
    return <Loading title="editor" />;
  }

  if (!draft.ok) {
    return (
      <PageState
        title="Editor unavailable"
        description={getErrorMessage(draft.error)}
        status="error"
      />
    );
  }

  const publicHref = `/f/${formSlug}`;
  const elementCount = schema.elements.length;
  const elementCountLabel = `${elementCount} ${elementCount === 1 ? "element" : "elements"}`;

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-background">
      <div className="z-30 flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b bg-background/95 px-4 py-1.5 backdrop-blur">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <Badge status="neutral">{elementCountLabel}</Badge>
          <DraftStatusBadge
            canRevert={Boolean(draft.data.publishedSchemaId)}
            disabled={publishing || reverting || saveState === "saving"}
            hasUnpublishedChanges={hasUnpublishedChanges}
            open={resetDialogOpen}
            saveState={saveState}
            reverting={reverting}
            onConfirm={() => void revertToPublished()}
            onOpenChange={setResetDialogOpen}
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button
            type="button"
            variant={aiOpen ? "default" : "outline"}
            size="dense"
            onClick={() => setAiOpen((current) => !current)}
          >
            <RiBardLine className="size-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </Button>
          <Button type="button" variant="outline" size="dense" asChild>
            <Link href={publicHref} target="_blank" rel="noopener noreferrer">
              <RiExternalLinkLine className="size-4" />
              <span className="hidden sm:inline">Open</span>
            </Link>
          </Button>
          <Button
            type="button"
            size="dense"
            onClick={publish}
            disabled={publishing || saveState === "saving"}
          >
            {publishing ? (
              <>
                <RiRefreshLine className="size-4 animate-spin" />
                Publishing
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <FormBuilderCanvas schema={schema} onSchemaChange={updateSchema} />
        </div>
        <FormAiSidebar
          formId={formId}
          open={aiOpen}
          schema={schema}
          onApplySchema={applyAiSchema}
          onOpenChange={setAiOpen}
        />
      </div>
    </div>
  );
}
