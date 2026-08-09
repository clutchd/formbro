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
import Link from "next/link";
import { HomeProductDemo } from "./home-product-demo";

const HERO_STEPS = [
  { label: "DESCRIBE", value: "Plain English" },
  { label: "REFINE", value: "Visual builder" },
  { label: "PUBLISH", value: "One clean form" },
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
    title: "Shape the workflow",
    description:
      "Turn a rough request into required fields, clear choices, and a reliable handoff for your team.",
  },
  {
    label: "OUTPUT",
    title: "Publish with confidence",
    description:
      "Give respondents a form that feels native, then keep every submission organized and ready to act on.",
  },
];

const INTEGRATIONS = ["Email", "Webhooks", "SMS", "PDFs", "CRM", "Sheets", "Zapier", "API"];

const POSITIONING_FEATURES = [
  {
    title: "AI-assisted first drafts",
    description:
      "Start from a plain-language brief and get a useful form structure instead of a blank canvas.",
  },
  {
    title: "A real visual builder",
    description:
      "Refine labels, fields, validation, and page structure directly on the canvas your team will use.",
  },
  {
    title: "Clean respondent experience",
    description:
      "Ship accessible, familiar forms that fit naturally into any customer or internal workflow.",
  },
  {
    title: "Built for operational work",
    description:
      "Handle intake, approvals, field reports, onboarding, and the small critical processes spreadsheets miss.",
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

const COPYRIGHT_YEAR = 2026;

export function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <WorkflowSection />
        <PositioningSection />
        <IntegrationsSection />
        <PricingSection />
      </main>
      <LandingFooter />
    </div>
  );
}

function LandingHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" aria-label="FormBro home">
        <Logo />
      </Link>
      <nav className="hidden items-center gap-6 font-mono text-xs tracking-wider text-muted-foreground uppercase md:flex">
        <Link href="#product" className="hover:text-foreground">
          Product
        </Link>
        <Link href="#workflow" className="hover:text-foreground">
          Workflow
        </Link>
        <Link href="#pricing" className="hover:text-foreground">
          Pricing
        </Link>
      </nav>
      <div className="flex items-center gap-2">
        <Button asChild variant="link" className="hidden sm:inline-flex">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Start trial</Link>
        </Button>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative border-t">
      <div className="absolute inset-x-0 top-0 -z-10 h-[72%] border-b bg-muted/30" />
      <div className="mx-auto grid w-full max-w-7xl gap-9 px-5 pt-8 pb-14 sm:px-8 sm:pt-12 lg:grid-cols-[0.78fr_1.22fr] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-0 lg:pt-16 lg:pb-20">
        <div className="max-w-2xl lg:col-start-1 lg:row-start-1 lg:self-end">
          <Badge status="neutral" className="mb-5 rounded-none">
            <RiSparklingLine /> AI-ASSISTED FORM BUILDER
          </Badge>
          <h1 className="font-display text-5xl leading-[0.95] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Describe the workflow. Ship the form.
          </h1>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <HomeProductDemo />
        </div>

        <div className="max-w-2xl lg:col-start-1 lg:row-start-2">
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Turn a plain-English brief into a polished form, refine it on a real visual canvas, and
            publish without rebuilding the same workflow from scratch.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Build your first form <RiArrowRightLine className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#product">See the product flow</Link>
            </Button>
          </div>

          <div className="mt-9 grid grid-cols-3 border-y bg-card/70">
            {HERO_STEPS.map((step) => (
              <div key={step.label} className="border-r px-3 py-4 last:border-r-0 sm:px-4">
                <div className="font-mono text-[0.6rem] tracking-wider text-muted-foreground uppercase sm:text-[0.65rem]">
                  {step.label}
                </div>
                <div className="mt-1 text-sm font-semibold tracking-tight sm:text-base">
                  {step.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
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
          Built for the work between a spreadsheet and custom software.
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

function PricingSection() {
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
            Start with the brief. Leave with the form.
          </h2>
        </div>
        <Button
          asChild
          size="lg"
          className="mt-6 bg-background text-foreground hover:bg-background/90 sm:mt-0"
        >
          <Link href="/sign-up">
            Start free trial <RiArrowRightLine className="size-4" />
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
          <span className="border px-3 py-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
            {APP_NAME} is MIT licensed
          </span>
          <Button asChild variant="outline" size="dense">
            <Link href="https://github.com/clutchd/formbro" target="_blank" rel="noreferrer">
              <RiGithubFill className="size-4" />
              GitHub
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
