"use client";

import type { FormInput } from "@formbro/core/schema/form";
import { applyFormSchemaEdit, type FormSchemaEditInput } from "@formbro/core/ai";
import { Form } from "@formbro/react/components/form";
import { APP_NAME, TAGLINE } from "@formbro/shared/brand";
import { Badge } from "@formbro/ui/badge";
import { Button } from "@formbro/ui/button";
import { Logo } from "@formbro/ui/logo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@formbro/ui/tooltip";
import {
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
  RiGithubFill,
  RiRefreshLine,
  RiSparklingLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import { useAppData } from "app/_data-provider";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { FormBuilderCanvas } from "@/components/form-builder/builder";
import { ThemeIcon, useToggleTheme } from "@/components/theme";
import { useDashboardPrewarmIntent } from "./(shell)/(app)/dashboard/(dashboard)/_data-provider";

type BuilderTemplate = {
  id: string;
  prompt: string;
  steps: [FormSchemaEditInput, ...FormSchemaEditInput[]];
  summary: string;
};
type BuilderDemoActivityRow = {
  id: string;
  label: string;
  status: "complete" | "streaming";
};
type BuilderDemoStreamState = {
  rows: BuilderDemoActivityRow[];
  status: "idle" | "streaming";
  summary: string | null;
};
type LinkIntent = ComponentProps<typeof Link>;

const HERO_STATS = [
  { label: "LICENSE", value: "MIT" },
  { label: "TRIAL", value: "7 DAYS" },
  { label: "SETUP", value: "MINUTES" },
];

const WORKFLOW_STEPS = [
  {
    label: "INPUT",
    title: "Capture clean data",
    description:
      "Spin up polished forms for client intake, field reports, approvals, and internal requests.",
  },
  {
    label: "PROCESS",
    title: "Route the workflow",
    description: "Turn every submission into a clean next step for the people who need it.",
  },
  {
    label: "OUTPUT",
    title: "Send it anywhere",
    description: "Email, webhooks, SMS, PDFs, exports, and automations for serious workflows.",
  },
];

const INTEGRATIONS = ["Email", "Webhooks", "SMS", "PDFs", "CRM", "Sheets", "Zapier", "API"];
const POSITIONING_FEATURES = [
  {
    title: "AI-assisted form drafts",
    description:
      "Start from a plain-language prompt, then refine the result in the builder instead of staring at a blank canvas.",
  },
  {
    title: "Fast publishing and submissions",
    description:
      "Share a usable form quickly, collect responses, and keep the work moving without extra setup.",
  },
  {
    title: "Simple enough for every team",
    description:
      "Clean defaults and familiar controls make forms approachable for ops, admin, and client-facing teams.",
  },
  {
    title: "Powerful enough for real operations",
    description:
      "Required fields, page breaks, draft publishing, workspace members, and response history are built in.",
  },
];
const COPYRIGHT_YEAR = 2026;
const BUILDER_DEMO_STEP_DELAY_MS = 620;
const BUILDER_DEMO_BETWEEN_STEP_DELAY_MS = 160;

const BUILDER_DEMO_BASE_SCHEMA: FormInput = {
  id: "homepage_builder_demo",
  version: "1.0.0",
  name: "Untitled form",
  elements: [],
  submit: { label: "Submit", size: "full-width" },
};

const BUILDER_TEMPLATES: [BuilderTemplate, ...BuilderTemplate[]] = [
  {
    id: "client_intake",
    prompt: "Create a client intake form for a service business.",
    summary: "Client Intake is ready for the first handoff.",
    steps: [
      {
        type: "set_form_name",
        label: "Naming the client intake",
        name: "Client Intake",
      },
      {
        type: "add_layout_elements",
        label: "Drafting the intake opening",
        elements: [
          {
            id: "client_heading",
            name: "Client intake heading",
            type: "heading",
            category: "element",
            label: "Tell us about the workflow",
            level: 1,
          },
          {
            id: "client_intro",
            name: "Client intake intro",
            type: "description",
            category: "element",
            label: "Share the basics and we will turn them into a clean next step for your team.",
          },
        ],
        placements: [{ id: "client_heading" }, { id: "client_intro", afterId: "client_heading" }],
      },
      {
        type: "add_fields",
        label: "Adding contact questions",
        elements: [
          {
            id: "client_name",
            name: "Client name",
            type: "short_text",
            category: "field",
            label: "Client name",
            placeholder: "Acme Operations",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "client_email",
            name: "Work email",
            type: "email",
            category: "field",
            label: "Work email",
            placeholder: "you@company.com",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "company_size",
            name: "Company size",
            type: "single_select",
            category: "field",
            label: "Company size",
            options: ["1-10", "11-50", "51-200", "200+"],
            placeholder: "Select a range",
          },
        ],
        placements: [
          { id: "client_name", afterId: "client_intro" },
          { id: "client_email", afterId: "client_name" },
          { id: "company_size", afterId: "client_email" },
        ],
      },
      {
        type: "add_fields",
        label: "Adding workflow details",
        elements: [
          {
            id: "workflow_type",
            name: "Workflow type",
            type: "single_select",
            category: "field",
            label: "What workflow are we upgrading?",
            options: ["Intake", "Approvals", "Field reports", "Onboarding"],
            placeholder: "Select a workflow",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "workflow_goal",
            name: "Workflow goal",
            type: "long_text",
            category: "field",
            label: "What needs to happen after someone submits?",
            description: "A short handoff note is enough for the first pass.",
            placeholder: "Create a task, notify ops, send a PDF...",
            rules: [{ type: "required", value: true }],
          },
        ],
        placements: [
          { id: "workflow_type", afterId: "company_size" },
          { id: "workflow_goal", afterId: "workflow_type" },
        ],
      },
      {
        type: "update_submit",
        label: "Setting the handoff button",
        submit: { label: "Submit intake", size: "full-width" },
      },
    ],
  },
  {
    id: "service_request",
    prompt: "Build a field service request for a facilities team.",
    summary: "Service Request is ready for dispatch.",
    steps: [
      {
        type: "set_form_name",
        label: "Naming the service request",
        name: "Service Request",
      },
      {
        type: "add_layout_elements",
        label: "Writing the dispatch intro",
        elements: [
          {
            id: "service_heading",
            name: "Service request heading",
            type: "heading",
            category: "element",
            label: "Route a service request",
            level: 1,
          },
          {
            id: "service_intro",
            name: "Service request intro",
            type: "description",
            category: "element",
            label: "Capture the site, urgency, and repair details in one clean workflow.",
          },
        ],
        placements: [
          { id: "service_heading" },
          { id: "service_intro", afterId: "service_heading" },
        ],
      },
      {
        type: "add_fields",
        label: "Adding location and owner fields",
        elements: [
          {
            id: "site",
            name: "Site or property",
            type: "short_text",
            category: "field",
            label: "Site or property",
            placeholder: "North warehouse",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "request_owner",
            name: "Request owner",
            type: "short_text",
            category: "field",
            label: "Request owner",
            placeholder: "Jordan Lee",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "owner_email",
            name: "Owner email",
            type: "email",
            category: "field",
            label: "Owner email",
            placeholder: "owner@company.com",
          },
        ],
        placements: [
          { id: "site", afterId: "service_intro" },
          { id: "request_owner", afterId: "site" },
          { id: "owner_email", afterId: "request_owner" },
        ],
      },
      {
        type: "add_fields",
        label: "Adding priority and repair details",
        elements: [
          {
            id: "priority",
            name: "Priority",
            type: "single_select",
            category: "field",
            label: "Priority",
            options: ["Routine", "Soon", "Urgent", "Emergency"],
            placeholder: "Select priority",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "request_details",
            name: "Request details",
            type: "long_text",
            category: "field",
            label: "What needs to happen?",
            description: "Include the deadline or handoff owner if you know it.",
            placeholder: "Repair dock door before Friday",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "reference_link",
            name: "Reference link",
            type: "link",
            category: "field",
            label: "Reference photo or ticket link",
            placeholder: "https://...",
          },
        ],
        placements: [
          { id: "priority", afterId: "owner_email" },
          { id: "request_details", afterId: "priority" },
          { id: "reference_link", afterId: "request_details" },
        ],
      },
      {
        type: "update_submit",
        label: "Setting the dispatch button",
        submit: { label: "Send request", size: "full-width" },
      },
    ],
  },
  {
    id: "vendor_onboarding",
    prompt: "Draft a vendor onboarding form with enough detail for accounting.",
    summary: "Vendor Onboarding is ready for accounting review.",
    steps: [
      {
        type: "set_form_name",
        label: "Naming the vendor onboarding form",
        name: "Vendor Onboarding",
      },
      {
        type: "add_layout_elements",
        label: "Creating the onboarding section",
        elements: [
          {
            id: "vendor_heading",
            name: "Vendor onboarding heading",
            type: "heading",
            category: "element",
            label: "Start vendor onboarding",
            level: 1,
          },
          {
            id: "vendor_intro",
            name: "Vendor onboarding intro",
            type: "description",
            category: "element",
            label: "Collect vendor identity, services, and payment details before setup.",
          },
        ],
        placements: [{ id: "vendor_heading" }, { id: "vendor_intro", afterId: "vendor_heading" }],
      },
      {
        type: "add_fields",
        label: "Adding vendor identity questions",
        elements: [
          {
            id: "vendor_name",
            name: "Vendor legal name",
            type: "short_text",
            category: "field",
            label: "Vendor legal name",
            placeholder: "Prime Mechanical LLC",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "vendor_contact_email",
            name: "Accounts payable email",
            type: "email",
            category: "field",
            label: "Accounts payable email",
            placeholder: "ap@vendor.com",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "tax_classification",
            name: "Tax classification",
            type: "single_select",
            category: "field",
            label: "Tax classification",
            options: ["Individual", "LLC", "Corporation", "Partnership"],
            placeholder: "Select one",
          },
        ],
        placements: [
          { id: "vendor_name", afterId: "vendor_intro" },
          { id: "vendor_contact_email", afterId: "vendor_name" },
          { id: "tax_classification", afterId: "vendor_contact_email" },
        ],
      },
      {
        type: "add_fields",
        label: "Adding service and spend details",
        elements: [
          {
            id: "services",
            name: "Services provided",
            type: "long_text",
            category: "field",
            label: "Services provided",
            placeholder: "Preventive maintenance, emergency repairs...",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "monthly_spend",
            name: "Estimated monthly spend",
            type: "number",
            category: "field",
            label: "Estimated monthly spend",
            placeholder: "2500",
          },
          {
            id: "payment_terms",
            name: "Preferred payment terms",
            type: "single_select",
            category: "field",
            label: "Preferred payment terms",
            options: ["Due on receipt", "Net 15", "Net 30", "Net 60"],
            placeholder: "Select terms",
          },
        ],
        placements: [
          { id: "services", afterId: "tax_classification" },
          { id: "monthly_spend", afterId: "services" },
          { id: "payment_terms", afterId: "monthly_spend" },
        ],
      },
      {
        type: "update_submit",
        label: "Setting the accounting handoff",
        submit: { label: "Submit vendor", size: "full-width" },
      },
    ],
  },
  {
    id: "event_registration",
    prompt: "Generate an event registration form for a hands-on workshop.",
    summary: "Workshop Registration is ready for signups.",
    steps: [
      {
        type: "set_form_name",
        label: "Naming the workshop registration",
        name: "Workshop Registration",
      },
      {
        type: "add_layout_elements",
        label: "Writing the registration intro",
        elements: [
          {
            id: "event_heading",
            name: "Workshop registration heading",
            type: "heading",
            category: "element",
            label: "Reserve your workshop seat",
            level: 1,
          },
          {
            id: "event_intro",
            name: "Workshop registration intro",
            type: "description",
            category: "element",
            label: "Tell us who is coming and what will make the session useful.",
          },
        ],
        placements: [{ id: "event_heading" }, { id: "event_intro", afterId: "event_heading" }],
      },
      {
        type: "add_fields",
        label: "Adding attendee questions",
        elements: [
          {
            id: "attendee_name",
            name: "Attendee name",
            type: "short_text",
            category: "field",
            label: "Attendee name",
            placeholder: "Taylor Morgan",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "attendee_email",
            name: "Attendee email",
            type: "email",
            category: "field",
            label: "Attendee email",
            placeholder: "you@example.com",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "company",
            name: "Company",
            type: "short_text",
            category: "field",
            label: "Company",
            placeholder: "Acme Operations",
          },
        ],
        placements: [
          { id: "attendee_name", afterId: "event_intro" },
          { id: "attendee_email", afterId: "attendee_name" },
          { id: "company", afterId: "attendee_email" },
        ],
      },
      {
        type: "add_fields",
        label: "Adding session preferences",
        elements: [
          {
            id: "session_track",
            name: "Session track",
            type: "single_select",
            category: "field",
            label: "Which track should we save?",
            options: ["Operations", "Sales", "Customer success", "Leadership"],
            placeholder: "Select a track",
            rules: [{ type: "required", value: true }],
          },
          {
            id: "workshop_goal",
            name: "Workshop goal",
            type: "long_text",
            category: "field",
            label: "What would make this workshop worth it?",
            placeholder: "Bring a messy process, leave with a better form.",
          },
        ],
        placements: [
          { id: "session_track", afterId: "company" },
          { id: "workshop_goal", afterId: "session_track" },
        ],
      },
      {
        type: "update_submit",
        label: "Setting the registration button",
        submit: { label: "Reserve seat", size: "full-width" },
      },
    ],
  },
];

function createBlankDemoSchema(template: BuilderTemplate): FormInput {
  return {
    ...BUILDER_DEMO_BASE_SCHEMA,
    id: `homepage_${template.id}`,
    elements: [],
  };
}

function buildDemoSchema(template: BuilderTemplate): FormInput {
  return template.steps.reduce((schema, step) => {
    return applyFormSchemaEdit(schema, step).schema;
  }, createBlankDemoSchema(template));
}

const INITIAL_BUILDER_TEMPLATE = BUILDER_TEMPLATES[0];
const INITIAL_BUILDER_SCHEMA = buildDemoSchema(INITIAL_BUILDER_TEMPLATE);
const INITIAL_BUILDER_STREAM_STATE: BuilderDemoStreamState = {
  rows: [],
  status: "idle",
  summary: INITIAL_BUILDER_TEMPLATE.summary,
};

const PLANS = [
  {
    name: "Basic",
    price: "$10",
    description: "Everything a lean team needs to run serious forms.",
    ctaLabel: "Start Basic Trial",
    ctaVariant: "outline",
    features: ["Unlimited seats", "10 forms", "1,000 submissions / month", "100GB storage"],
  },
  {
    name: "Pro",
    price: "$25",
    description: "More room for teams with heavier workflows.",
    ctaLabel: "Start Pro Trial",
    ctaVariant: "default",
    features: ["Unlimited seats", "100 forms", "10,000 submissions / month", "1TB storage"],
  },
] as const;

export function HomePage() {
  const { authUser } = useAppData();
  const isAuthenticated = Boolean(authUser?.ok && authUser.data);
  const dashboardPrewarmIntent = useDashboardPrewarmIntent({ eager: true });

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <LandingHeader
        isAuthenticated={isAuthenticated}
        dashboardPrewarmIntent={dashboardPrewarmIntent}
      />
      <main>
        <HeroSection
          isAuthenticated={isAuthenticated}
          dashboardPrewarmIntent={dashboardPrewarmIntent}
        />
        <WorkflowSection />
        <PositioningSection />
        <IntegrationsSection />
        <PricingSection isAuthenticated={isAuthenticated} />
      </main>
      <LandingFooter />
    </div>
  );
}

function LandingHeader({
  isAuthenticated,
  dashboardPrewarmIntent,
}: {
  isAuthenticated: boolean;
  dashboardPrewarmIntent: LinkIntent;
}) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" aria-label="FormBro home">
        <Logo />
      </Link>
      <nav className="hidden items-center gap-6 font-mono text-xs tracking-wider text-muted-foreground uppercase md:flex">
        <Link href="#builder" className="hover:text-foreground">
          Builder
        </Link>
        <Link href="#workflow" className="hover:text-foreground">
          Workflow
        </Link>
        <Link href="#pricing" className="hover:text-foreground">
          Pricing
        </Link>
      </nav>
      {isAuthenticated ? (
        <Button asChild variant="outline">
          <Link {...dashboardPrewarmIntent}>Dashboard</Link>
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button asChild variant="link" className="hidden sm:inline-flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Start trial</Link>
          </Button>
        </div>
      )}
    </header>
  );
}

function HeroSection({
  isAuthenticated,
  dashboardPrewarmIntent,
}: {
  isAuthenticated: boolean;
  dashboardPrewarmIntent: LinkIntent;
}) {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-5 pt-10 pb-16 sm:px-8 lg:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[560px] border-b bg-muted/30" />

      <div className="max-w-4xl">
        <Badge status="neutral" className="mb-5 rounded-none">
          {TAGLINE.toUpperCase()}
        </Badge>
        <h1 className="max-w-3xl font-display text-5xl leading-[0.95] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          Serious forms without the enterprise tax.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Create, publish, and automate forms for intake, approvals, field ops, and onboarding.
          FormBro stays simple on the surface while giving teams the control to run serious
          workflows.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <PrimaryCta
            isAuthenticated={isAuthenticated}
            dashboardPrewarmIntent={dashboardPrewarmIntent}
          />
          <SecondaryCta isAuthenticated={isAuthenticated} />
        </div>

        <div className="mt-10 grid max-w-xl grid-cols-3 border-y bg-card/70">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="border-r px-4 py-4 last:border-r-0">
              <div className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                {stat.label}
              </div>
              <div className="mt-1 font-display text-xl font-bold tracking-tight">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <BuilderDemo
        isAuthenticated={isAuthenticated}
        dashboardPrewarmIntent={dashboardPrewarmIntent}
      />
    </section>
  );
}

function PrimaryCta({
  isAuthenticated,
  dashboardPrewarmIntent,
}: {
  isAuthenticated: boolean;
  dashboardPrewarmIntent: LinkIntent;
}) {
  return isAuthenticated ? (
    <Button asChild size="lg">
      <Link {...dashboardPrewarmIntent}>
        Open dashboard <RiArrowRightLine className="size-4" />
      </Link>
    </Button>
  ) : (
    <Button asChild size="lg">
      <Link href="/sign-up">
        Start free trial <RiArrowRightLine className="size-4" />
      </Link>
    </Button>
  );
}

function SecondaryCta({ isAuthenticated }: { isAuthenticated: boolean }) {
  return isAuthenticated ? (
    <Button asChild variant="outline" size="lg">
      <Link href="#builder">Try the builder</Link>
    </Button>
  ) : (
    <Button asChild variant="outline" size="lg">
      <Link href="/sign-in">Sign in</Link>
    </Button>
  );
}

function BuilderDemo({
  isAuthenticated,
  dashboardPrewarmIntent,
}: {
  isAuthenticated: boolean;
  dashboardPrewarmIntent: LinkIntent;
}) {
  const [templateIndex, setTemplateIndex] = useState(0);
  const activeTemplate = BUILDER_TEMPLATES[templateIndex] ?? BUILDER_TEMPLATES[0];
  const [schema, setSchema] = useState<FormInput>(INITIAL_BUILDER_SCHEMA);
  const [streamState, setStreamState] = useState<BuilderDemoStreamState>(
    INITIAL_BUILDER_STREAM_STATE,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const demoRunIdRef = useRef(0);
  const demoIsStreamingRef = useRef(false);
  const builderCanvasViewportRef = useRef<HTMLDivElement>(null);
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      demoRunIdRef.current += 1;
      demoIsStreamingRef.current = false;
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  const waitForNextStep = (duration: number) =>
    new Promise<void>((resolve) => {
      timeoutIdRef.current = window.setTimeout(() => {
        timeoutIdRef.current = null;
        resolve();
      }, duration);
    });

  const applyAiDraft = async () => {
    if (demoIsStreamingRef.current || streamState.status === "streaming") return;

    const nextIndex = (templateIndex + 1) % BUILDER_TEMPLATES.length;
    const nextTemplate = BUILDER_TEMPLATES[nextIndex] ?? BUILDER_TEMPLATES[0];
    const runId = demoRunIdRef.current + 1;
    let nextSchema = createBlankDemoSchema(nextTemplate);

    demoRunIdRef.current = runId;
    demoIsStreamingRef.current = true;
    builderCanvasViewportRef.current?.scrollTo({ top: 0 });
    setTemplateIndex(nextIndex);
    setSchema(nextSchema);
    setStreamState({
      rows: [],
      status: "streaming",
      summary: null,
    });

    try {
      for (const [stepIndex, step] of nextTemplate.steps.entries()) {
        if (demoRunIdRef.current !== runId) return;

        const rowId = `${nextTemplate.id}-${stepIndex}`;
        setStreamState((current) => ({
          ...current,
          rows: [...current.rows, { id: rowId, label: step.label, status: "streaming" }],
        }));

        await waitForNextStep(BUILDER_DEMO_STEP_DELAY_MS);
        if (demoRunIdRef.current !== runId) return;

        const result = applyFormSchemaEdit(nextSchema, step);
        nextSchema = result.schema;

        setSchema(nextSchema);
        setStreamState((current) => ({
          ...current,
          rows: current.rows.map((row) =>
            row.id === rowId ? { ...row, status: "complete" } : row,
          ),
        }));

        await waitForNextStep(BUILDER_DEMO_BETWEEN_STEP_DELAY_MS);
      }

      if (demoRunIdRef.current !== runId) return;

      setStreamState((current) => ({
        ...current,
        status: "idle",
        summary: nextTemplate.summary,
      }));
    } catch (error) {
      console.error("Homepage builder demo failed", error);
      setSchema(buildDemoSchema(nextTemplate));
      setStreamState({
        rows: nextTemplate.steps.map((step, stepIndex) => ({
          id: `${nextTemplate.id}-${stepIndex}`,
          label: step.label,
          status: "complete",
        })),
        status: "idle",
        summary: nextTemplate.summary,
      });
    } finally {
      if (demoRunIdRef.current === runId) {
        demoIsStreamingRef.current = false;
      }
    }
  };

  return (
    <>
      <section
        id="builder"
        aria-label="Interactive form builder demo"
        className="mt-10 rounded-xl border bg-card p-2 shadow-2xl shadow-brand-950/10 lg:mt-12"
      >
        {isFullscreen ? (
          <div
            className="grid place-items-center rounded-lg border bg-background p-8 text-center lg:h-[640px] lg:max-h-[76vh] lg:min-h-[520px]"
            aria-hidden="true"
          >
            <div>
              <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                Full screen active
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                The builder demo is open above the page.
              </p>
            </div>
          </div>
        ) : (
          <BuilderDemoWorkbench
            builderCanvasViewportRef={builderCanvasViewportRef}
            dashboardPrewarmIntent={dashboardPrewarmIntent}
            isAuthenticated={isAuthenticated}
            prompt={activeTemplate.prompt}
            schema={schema}
            streamState={streamState}
            viewMode="inline"
            onEnterFullscreen={() => setIsFullscreen(true)}
            onGenerate={applyAiDraft}
            onSchemaChange={setSchema}
          />
        )}
      </section>

      {isFullscreen ? (
        <div
          className="fixed inset-0 z-50 bg-background p-2 sm:p-4"
          role="dialog"
          aria-label="Full screen builder demo"
          aria-modal="true"
        >
          <BuilderDemoWorkbench
            builderCanvasViewportRef={builderCanvasViewportRef}
            dashboardPrewarmIntent={dashboardPrewarmIntent}
            isAuthenticated={isAuthenticated}
            prompt={activeTemplate.prompt}
            schema={schema}
            streamState={streamState}
            viewMode="fullscreen"
            onExitFullscreen={() => setIsFullscreen(false)}
            onGenerate={applyAiDraft}
            onSchemaChange={setSchema}
          />
        </div>
      ) : null}
    </>
  );
}

function BuilderDemoWorkbench({
  builderCanvasViewportRef,
  dashboardPrewarmIntent,
  isAuthenticated,
  prompt,
  schema,
  streamState,
  viewMode,
  onEnterFullscreen,
  onExitFullscreen,
  onGenerate,
  onSchemaChange,
}: {
  builderCanvasViewportRef: RefObject<HTMLDivElement | null>;
  dashboardPrewarmIntent: LinkIntent;
  isAuthenticated: boolean;
  prompt: string;
  schema: FormInput;
  streamState: BuilderDemoStreamState;
  viewMode: "fullscreen" | "inline";
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
  onGenerate: () => void;
  onSchemaChange: Dispatch<SetStateAction<FormInput>>;
}) {
  return (
    <div
      className={
        viewMode === "fullscreen"
          ? "grid h-full min-h-0 overflow-hidden rounded-xl border bg-background shadow-2xl lg:grid-cols-[1.05fr_0.95fr]"
          : "grid overflow-hidden rounded-lg border bg-background lg:h-[640px] lg:max-h-[76vh] lg:min-h-[520px] lg:grid-cols-[1.05fr_0.95fr]"
      }
    >
      <div className="flex min-h-0 flex-col border-b bg-muted/40 lg:border-r lg:border-b-0">
        <BuilderDemoHeader
          dashboardPrewarmIntent={dashboardPrewarmIntent}
          isAuthenticated={isAuthenticated}
          prompt={prompt}
          streamState={streamState}
          viewMode={viewMode}
          onEnterFullscreen={onEnterFullscreen}
          onExitFullscreen={onExitFullscreen}
          onGenerate={onGenerate}
        />
        <div ref={builderCanvasViewportRef} className="min-h-0 flex-1 overflow-y-auto">
          <FormBuilderCanvas
            schema={schema}
            onSchemaChange={(updater) => onSchemaChange((current) => updater(current))}
            density="compact"
            className="max-w-none px-4 py-4"
          />
        </div>
      </div>
      <RealFormPreview schema={schema} />
    </div>
  );
}

function BuilderDemoHeader({
  dashboardPrewarmIntent,
  isAuthenticated,
  prompt,
  streamState,
  viewMode,
  onEnterFullscreen,
  onExitFullscreen,
  onGenerate,
}: {
  dashboardPrewarmIntent: LinkIntent;
  isAuthenticated: boolean;
  prompt: string;
  streamState: BuilderDemoStreamState;
  viewMode: "fullscreen" | "inline";
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
  onGenerate: () => void;
}) {
  const isStreaming = streamState.status === "streaming";
  const fullScreenLabel = viewMode === "fullscreen" ? "Exit full screen" : "Full screen";
  const toggleFullscreen = viewMode === "fullscreen" ? onExitFullscreen : onEnterFullscreen;
  const FullScreenIcon = viewMode === "fullscreen" ? RiFullscreenExitLine : RiFullscreenLine;
  const builderCtaIntent: LinkIntent = isAuthenticated
    ? dashboardPrewarmIntent
    : { href: "/sign-up" };

  return (
    <div className="border-b bg-card p-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
            Actual builder
          </div>
          <div className="font-display text-base font-bold tracking-tight">
            Edit the real canvas
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge status="success" className="rounded-none">
            LIVE
          </Badge>
          {toggleFullscreen ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="size-8 rounded-md p-0"
                    aria-label={fullScreenLabel}
                    onClick={toggleFullscreen}
                  >
                    <FullScreenIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{fullScreenLabel}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>
      </div>
      <div className="mt-3 rounded-lg border bg-background p-2.5">
        <div className="mb-1.5 flex items-center gap-2">
          <RiSparklingLine className="size-4 text-brand" />
          <span className="font-mono text-xs tracking-wider uppercase">AI draft prompt</span>
        </div>
        <p className="text-sm leading-5 text-muted-foreground">{prompt}</p>
        <BuilderDemoActivity streamState={streamState} />
        <Button
          type="button"
          size="dense"
          className="mt-2.5 w-full"
          disabled={isStreaming}
          onClick={onGenerate}
        >
          {isStreaming ? (
            <RiRefreshLine className="size-4 animate-spin" />
          ) : (
            <RiSparklingLine className="size-4" />
          )}
          {isStreaming ? "Generating draft" : "Generate another draft"}
        </Button>
        <Button asChild variant="outline" size="dense" className="mt-2 w-full">
          <Link {...builderCtaIntent}>
            {isAuthenticated ? "Save in dashboard" : "Save and publish this form"}
            <RiArrowRightLine className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function BuilderDemoActivity({ streamState }: { streamState: BuilderDemoStreamState }) {
  return (
    <div
      className="mt-2.5 space-y-0.5 border-t pt-2.5"
      aria-live={streamState.status === "streaming" ? "polite" : undefined}
    >
      {streamState.rows.map((row) => (
        <BuilderDemoStatusRow
          key={row.id}
          icon={row.status === "complete" ? RiCheckboxCircleLine : RiRefreshLine}
          label={row.label}
          loading={row.status === "streaming"}
        />
      ))}
      {streamState.summary ? (
        <BuilderDemoStatusRow icon={RiCheckboxCircleLine} label={streamState.summary} />
      ) : null}
    </div>
  );
}

function BuilderDemoStatusRow({
  icon: Icon,
  label,
  loading = false,
}: {
  icon: RemixiconComponentType;
  label: string;
  loading?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 px-1 text-[0.82rem] text-muted-foreground">
      <Icon className={`size-3.5 shrink-0 ${loading ? "animate-spin text-primary" : ""}`} />
      <span className="min-w-0 leading-snug font-medium">{label}</span>
    </div>
  );
}

function RealFormPreview({ schema }: { schema: FormInput }) {
  return (
    <div className="flex min-h-0 flex-col bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div>
          <div className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
            Public form preview
          </div>
          <div className="font-display text-base font-bold tracking-tight">
            What respondents see
          </div>
        </div>
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-red-400" />
          <span className="size-2 rounded-full bg-amber-400" />
          <span className="size-2 rounded-full bg-green-400" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-size-[32px_32px] px-4 pt-8 pb-5 sm:px-5 sm:pt-10">
        <div className="w-full max-w-sm rounded-xl border bg-background p-5 shadow-xl">
          <div className="mb-4">
            <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              {APP_NAME} Preview
            </div>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight">{schema.name}</h2>
            <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
              This is the live form experience your respondents will use.
            </p>
          </div>
          <Form schema={schema} preview />
        </div>
      </div>
    </div>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="border-y bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-0 px-5 sm:px-8 lg:grid-cols-3">
        {WORKFLOW_STEPS.map((step) => (
          <article
            key={step.label}
            className="border-primary-foreground/20 py-8 lg:border-r lg:px-8 lg:last:border-r-0"
          >
            <div className="font-mono text-xs tracking-wider text-primary-foreground/60 uppercase">
              {step.label}
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">{step.title}</h2>
            <p className="mt-3 leading-7 text-primary-foreground/70">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PositioningSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:py-24">
      <div>
        <Badge status="neutral" className="rounded-none">
          NOT JUST MARKETING FORMS
        </Badge>
        <h2 className="mt-5 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Built for the businesses still stuck between spreadsheets and custom software.
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
          FormBro is for intake, approvals, field ops, compliance packets, vendor onboarding, and
          every small-but-critical workflow that should not need a six-figure build.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {POSITIONING_FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-lg border bg-card p-5">
            <RiCheckboxCircleLine className="mb-5 size-5 text-brand" />
            <h3 className="font-display text-xl font-bold tracking-tight">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function IntegrationsSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-24">
      <div className="rounded-2xl border bg-card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                Integrations
              </div>
              <Badge status="warning" className="rounded-none">
                Coming soon
              </Badge>
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Capture once. Push everywhere.
            </h2>
          </div>
          <p className="max-w-xl leading-7 text-muted-foreground">
            FormBro is built to become the input layer for every system your business depends on.
            Capture the request once, then route the handoff without duct tape.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {INTEGRATIONS.map((integration) => (
            <div
              key={integration}
              className="border bg-background px-3 py-4 text-center font-mono text-xs tracking-wider text-muted-foreground uppercase"
            >
              {integration}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge status="neutral" className="rounded-none">
            SIMPLE PRICING
          </Badge>
          <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Start lean. Upgrade when the workflow earns it.
          </h2>
        </div>
        <p className="max-w-md leading-7 text-muted-foreground">
          No seat math. No quote request. Start with a trial and prove the workflow before you buy.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {PLANS.map((plan) => (
          <PlanCard key={plan.name} isAuthenticated={isAuthenticated} plan={plan} />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border bg-primary p-6 text-primary-foreground sm:flex sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="font-mono text-xs tracking-wider text-primary-foreground/60 uppercase">
            Launch access
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
            Try the builder, then make the real thing.
          </h2>
        </div>
        <Button
          asChild
          size="lg"
          className="mt-6 bg-background text-foreground hover:bg-background/90 sm:mt-0"
        >
          <Link href={isAuthenticated ? "/dashboard" : "/sign-up"}>
            {isAuthenticated ? "Open dashboard" : "Start free trial"}
            <RiArrowRightLine className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function PlanCard({
  isAuthenticated,
  plan,
}: {
  isAuthenticated: boolean;
  plan: (typeof PLANS)[number];
}) {
  const ctaHref = isAuthenticated ? "/dashboard" : "/sign-up";
  const ctaLabel = isAuthenticated ? "Open Dashboard" : plan.ctaLabel;

  return (
    <article className="rounded-2xl border bg-card p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-3xl font-bold tracking-tight">{plan.name}</h3>
          <p className="mt-2 text-muted-foreground">{plan.description}</p>
        </div>
        <div className="text-right">
          <div className="font-display text-4xl font-bold tracking-tight">{plan.price}</div>
          <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            / month
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm">
            <RiCheckboxCircleLine className="size-4 shrink-0 text-brand" />
            {feature}
          </div>
        ))}
      </div>
      <Button asChild variant={plan.ctaVariant} className="mt-8 w-full">
        <Link href={ctaHref}>
          {ctaLabel} <RiArrowRightLine className="size-4" />
        </Link>
      </Button>
    </article>
  );
}

function LandingFooter() {
  const { isDark, toggle } = useToggleTheme();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo className="text-xl" />
          <p className="mt-2 text-sm text-muted-foreground">
            © {COPYRIGHT_YEAR} Clutchd, LLC. {TAGLINE}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="dense">
            <Link href="https://github.com/clutchd/formbro" target="_blank" rel="noreferrer">
              <RiGithubFill className="size-4" />
              GitHub
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="dense"
            onClick={toggle}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            <ThemeIcon />
            {isDark ? "Light mode" : "Dark mode"}
          </Button>
        </div>
      </div>
    </footer>
  );
}
