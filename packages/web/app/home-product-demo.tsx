"use client";

import {
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiDraggable,
  RiRefreshLine,
  RiSparklingLine,
} from "@remixicon/react";
import { useState } from "react";

type DemoField = {
  label: string;
  placeholder: string;
  required?: boolean;
  type: "email" | "select" | "text";
  options?: string[];
};

type DemoTemplate = {
  id: string;
  name: string;
  prompt: string;
  submitLabel: string;
  fields: [DemoField, DemoField, DemoField];
};

const DEMOS: [DemoTemplate, ...DemoTemplate[]] = [
  {
    id: "client-intake",
    name: "Client Intake",
    prompt: "Create a client intake form for a service business.",
    submitLabel: "Submit intake",
    fields: [
      {
        label: "Client name",
        placeholder: "Acme Operations",
        required: true,
        type: "text",
      },
      {
        label: "Work email",
        placeholder: "you@company.com",
        required: true,
        type: "email",
      },
      {
        label: "What workflow are we upgrading?",
        placeholder: "Select a workflow",
        required: true,
        type: "select",
        options: ["Intake", "Approvals", "Field reports", "Onboarding"],
      },
    ],
  },
  {
    id: "service-request",
    name: "Service Request",
    prompt: "Build a field service request for a facilities team.",
    submitLabel: "Send request",
    fields: [
      {
        label: "Site or property",
        placeholder: "North warehouse",
        required: true,
        type: "text",
      },
      {
        label: "Request owner",
        placeholder: "Jordan Lee",
        required: true,
        type: "text",
      },
      {
        label: "Priority",
        placeholder: "Select priority",
        required: true,
        type: "select",
        options: ["Routine", "Soon", "Urgent", "Emergency"],
      },
    ],
  },
  {
    id: "vendor-onboarding",
    name: "Vendor Onboarding",
    prompt: "Draft a vendor onboarding form for accounting.",
    submitLabel: "Submit vendor",
    fields: [
      {
        label: "Vendor legal name",
        placeholder: "Prime Mechanical LLC",
        required: true,
        type: "text",
      },
      {
        label: "Accounts payable email",
        placeholder: "ap@vendor.com",
        required: true,
        type: "email",
      },
      {
        label: "Tax classification",
        placeholder: "Select one",
        type: "select",
        options: ["Individual", "LLC", "Corporation", "Partnership"],
      },
    ],
  },
];

export function HomeProductDemo() {
  const [demoIndex, setDemoIndex] = useState(0);
  const demo = DEMOS[demoIndex] ?? DEMOS[0];

  const showNextDemo = () => {
    setDemoIndex((current) => (current + 1) % DEMOS.length);
  };

  return (
    <section
      id="product"
      aria-label="FormBro product flow"
      className="overflow-hidden rounded-xl border bg-card p-2 shadow-2xl shadow-brand-950/10"
    >
      <div className="overflow-hidden rounded-lg border bg-background">
        <header className="flex items-center justify-between gap-4 border-b bg-card px-4 py-3">
          <div>
            <div className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
              Product flow
            </div>
            <div className="font-display text-base font-bold tracking-tight">
              Brief → builder → live form
            </div>
          </div>
          <span className="border border-green-300 bg-green-100 px-2 py-0.5 font-mono text-[0.65rem] font-medium tracking-wider text-green-950 uppercase dark:border-green-400/40 dark:bg-green-400/15 dark:text-green-200">
            Live example
          </span>
        </header>

        <div className="grid lg:min-h-[520px] lg:grid-cols-[0.78fr_1.22fr]">
          <div className="flex flex-col border-b bg-muted/40 p-3.5 lg:border-r lg:border-b-0 lg:p-4">
            <div className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
              <RiSparklingLine className="size-4 text-brand" /> AI draft brief
            </div>
            <div className="mt-3 rounded-lg border bg-background p-3">
              <p className="text-sm leading-6 font-medium">{demo.prompt}</p>
            </div>

            <div className="mt-3 border-t pt-2.5 lg:mt-5 lg:pt-4">
              <DemoStatus label="Named and structured the form" />
              <DemoStatus label={`Added ${demo.fields.length} essential fields`} />
              <DemoStatus label="Applied required validation" />
            </div>

            <div className="mt-2.5 lg:mt-auto lg:pt-5">
              <p className="mb-3 hidden text-xs leading-5 text-muted-foreground lg:block">
                Start with a useful draft, then change every field on the visual canvas.
              </p>
              <button
                type="button"
                onClick={showNextDemo}
                className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium whitespace-nowrap text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <RiRefreshLine className="size-4" />
                Generate another example
              </button>
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <div>
                <div className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                  Editable canvas
                </div>
                <div className="font-display text-base font-bold tracking-tight">{demo.name}</div>
              </div>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="size-2 rounded-full bg-red-400" />
                <span className="size-2 rounded-full bg-amber-400" />
                <span className="size-2 rounded-full bg-green-400" />
              </div>
            </div>

            <div className="flex flex-1 items-start justify-center bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-size-[28px_28px] p-4 sm:p-5">
              <div
                key={demo.id}
                className="w-full max-w-sm rounded-xl border bg-background p-4 shadow-xl"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                      Public form preview
                    </div>
                    <h2 className="mt-1 font-display text-xl font-bold tracking-tight">
                      {demo.name}
                    </h2>
                  </div>
                  <span className="border bg-muted px-2 py-0.5 font-mono text-[0.6rem] tracking-wider text-muted-foreground uppercase">
                    Draft
                  </span>
                </div>

                <div className="space-y-3">
                  {demo.fields.map((field) => (
                    <DemoFieldControl key={field.label} field={field} />
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-4 inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {demo.submitLabel} <RiArrowRightLine className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 border-t bg-card text-center font-mono text-[0.6rem] tracking-wider text-muted-foreground uppercase">
              <div className="border-r px-2 py-2.5">Drafted by AI</div>
              <div className="border-r px-2 py-2.5">Fully editable</div>
              <div className="px-2 py-2.5">Ready to publish</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoStatus({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground">
      <RiCheckboxCircleLine className="size-4 shrink-0 text-green-600 dark:text-green-400" />
      <span>{label}</span>
    </div>
  );
}

function DemoFieldControl({ field }: { field: DemoField }) {
  const controlClassName =
    "mt-1.5 h-8 w-full rounded-md border bg-background px-2.5 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

  return (
    <div className="group relative rounded-lg border border-transparent px-2 py-1.5 hover:border-border hover:bg-muted/30">
      <RiDraggable
        className="absolute top-2 right-1 size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
      <label className="block pr-4 text-xs font-medium">
        {field.label}
        {field.required ? <span aria-hidden="true"> *</span> : null}
        {field.type === "select" ? (
          <select
            aria-label={field.label}
            defaultValue=""
            className={controlClassName}
            required={field.required}
          >
            <option value="" disabled>
              {field.placeholder}
            </option>
            {field.options?.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            aria-label={field.label}
            className={controlClassName}
            placeholder={field.placeholder}
            required={field.required}
            type={field.type}
          />
        )}
      </label>
    </div>
  );
}
