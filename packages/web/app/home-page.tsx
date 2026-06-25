"use client";

import type { FormInput } from "@formbro/core/schema/form";
import { Form } from "@formbro/react/components/form";
import { APP_NAME, TAGLINE } from "@formbro/shared/brand";
import { Badge } from "@formbro/ui/badge";
import { Button } from "@formbro/ui/button";
import { Logo } from "@formbro/ui/logo";
import {
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiGithubFill,
  RiSparklingLine,
} from "@remixicon/react";
import { useAppData } from "app/_data-provider";
import Link from "next/link";
import { useState, type ComponentProps } from "react";
import { FormBuilderCanvas } from "@/components/form-builder-canvas";
import { ThemeIcon, useToggleTheme } from "@/components/theme";
import { useDashboardPrewarmIntent } from "./(app)/dashboard/(dashboard)/_data-provider";

type BuilderTemplate = {
  prompt: string;
  schema: FormInput;
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
  "AI-assisted form drafts",
  "Fast publishing and submissions",
  "Simple enough for every team",
  "Powerful enough for real operations",
];
const COPYRIGHT_YEAR = 2026;

const BUILDER_TEMPLATES: [BuilderTemplate, ...BuilderTemplate[]] = [
  {
    prompt: "Create a client intake form for a service business.",
    schema: {
      id: "homepage_client_intake",
      version: "1.0.0",
      name: "Client Intake",
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
          id: "client_name",
          name: "Client name",
          type: "short_text",
          category: "field",
          label: "Client name",
          placeholder: "Acme Operations",
          rules: [{ type: "required", value: true }],
        },
        {
          id: "workflow_goal",
          name: "Workflow goal",
          type: "short_text",
          category: "field",
          label: "What workflow are we upgrading?",
          description: "A sentence is enough for the first pass.",
          placeholder: "Quote requests, job intake, vendor onboarding...",
        },
      ],
      submit: { label: "Submit request", size: "full-width" },
    },
  },
  {
    prompt: "Build a field service request for a facilities team.",
    schema: {
      id: "homepage_service_request",
      version: "1.0.0",
      name: "Service Request",
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
          id: "site",
          name: "Site or property",
          type: "short_text",
          category: "field",
          label: "Site or property",
          placeholder: "North warehouse",
          rules: [{ type: "required", value: true }],
        },
        {
          id: "request_details",
          name: "Request details",
          type: "short_text",
          category: "field",
          label: "What needs to happen?",
          description: "Include the deadline or handoff owner if you know it.",
          placeholder: "Repair dock door before Friday",
          rules: [{ type: "required", value: true }],
        },
      ],
      submit: { label: "Send request", size: "full-width" },
    },
  },
  {
    prompt: "Draft a vendor onboarding form with enough detail for accounting.",
    schema: {
      id: "homepage_vendor_onboarding",
      version: "1.0.0",
      name: "Vendor Onboarding",
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
          id: "vendor_name",
          name: "Vendor legal name",
          type: "short_text",
          category: "field",
          label: "Vendor legal name",
          placeholder: "Prime Mechanical LLC",
          rules: [{ type: "required", value: true }],
        },
        {
          id: "services",
          name: "Services provided",
          type: "short_text",
          category: "field",
          label: "Services provided",
          placeholder: "Preventive maintenance, emergency repairs...",
        },
      ],
      submit: { label: "Submit vendor", size: "full-width" },
    },
  },
];

const PLANS = [
  {
    name: "Basic",
    price: "$10",
    description: "Everything a lean team needs to run serious forms.",
    features: ["Unlimited seats", "10 forms", "1,000 submissions / month", "100GB storage"],
  },
  {
    name: "Pro",
    price: "$25",
    description: "More room for teams with heavier workflows.",
    features: ["Unlimited seats", "100 forms", "10,000 submissions / month", "1TB storage"],
  },
];

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

      <BuilderDemo />
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

function BuilderDemo() {
  const [templateIndex, setTemplateIndex] = useState(0);
  const activeTemplate = BUILDER_TEMPLATES[templateIndex] ?? BUILDER_TEMPLATES[0];
  const [schema, setSchema] = useState<FormInput>(activeTemplate.schema);

  const applyAiDraft = () => {
    const nextIndex = (templateIndex + 1) % BUILDER_TEMPLATES.length;
    const nextTemplate = BUILDER_TEMPLATES[nextIndex] ?? BUILDER_TEMPLATES[0];
    setTemplateIndex(nextIndex);
    setSchema(nextTemplate.schema);
  };

  return (
    <section
      id="builder"
      aria-label="Interactive form builder demo"
      className="mt-12 rounded-2xl border bg-card p-3 shadow-2xl shadow-brand-950/10 lg:mt-14"
    >
      <div className="grid min-h-[620px] overflow-hidden rounded-xl border bg-background lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex min-h-0 flex-col border-b bg-muted/40 lg:border-r lg:border-b-0">
          <BuilderDemoHeader prompt={activeTemplate.prompt} onGenerate={applyAiDraft} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <FormBuilderCanvas
              schema={schema}
              onSchemaChange={(updater) => setSchema((current) => updater(current))}
              className="max-w-none px-5 py-8"
            />
          </div>
        </div>
        <RealFormPreview schema={schema} />
      </div>
    </section>
  );
}

function BuilderDemoHeader({ prompt, onGenerate }: { prompt: string; onGenerate: () => void }) {
  return (
    <div className="border-b bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
            Actual builder
          </div>
          <div className="font-display text-lg font-bold tracking-tight">Edit the real canvas</div>
        </div>
        <Badge status="success" className="rounded-none">
          LIVE
        </Badge>
      </div>
      <div className="mt-4 rounded-lg border bg-background p-3">
        <div className="mb-2 flex items-center gap-2">
          <RiSparklingLine className="size-4 text-brand" />
          <span className="font-mono text-xs tracking-wider uppercase">AI draft prompt</span>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{prompt}</p>
        <Button type="button" className="mt-3 w-full" onClick={onGenerate}>
          <RiSparklingLine className="size-4" />
          Generate another draft
        </Button>
      </div>
    </div>
  );
}

function RealFormPreview({ schema }: { schema: FormInput }) {
  return (
    <div className="flex flex-col bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
            Public form preview
          </div>
          <div className="font-display text-lg font-bold tracking-tight">What respondents see</div>
        </div>
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-red-400" />
          <span className="size-2 rounded-full bg-amber-400" />
          <span className="size-2 rounded-full bg-green-400" />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-size-[32px_32px] p-4 sm:p-8">
        <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl">
          <div className="mb-6">
            <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              {APP_NAME} Preview
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">{schema.name}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
        {POSITIONING_FEATURES.map((item) => (
          <div key={item} className="rounded-lg border bg-card p-5">
            <RiCheckboxCircleLine className="mb-5 size-5 text-brand" />
            <h3 className="font-display text-xl font-bold tracking-tight">{item}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Practical defaults, fewer clicks, and a product surface designed for operators, not
              enterprise procurement theater.
            </p>
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

function PricingSection({ isAuthenticated }: { isAuthenticated: boolean }) {
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
          <PlanCard key={plan.name} plan={plan} />
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

function PlanCard({ plan }: { plan: (typeof PLANS)[number] }) {
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
