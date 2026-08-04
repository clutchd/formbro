import type { Metadata } from "next";
import { Badge } from "@formbro/ui/badge";
import { Button } from "@formbro/ui/button";
import { Logo } from "@formbro/ui/logo";
import {
  RiArrowRightLine,
  RiBracesLine,
  RiCheckboxCircleLine,
  RiDatabaseLine,
  RiFlashlightLine,
  RiGithubFill,
  RiLinkM,
  RiRobotLine,
  RiRouteLine,
  RiShieldCheckLine,
  RiTeamLine,
  RiTimerFlashLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hosted forms for AI agents",
  description:
    "The accountless FormBro workflow for AI agents: create a hosted form, pay with x402, and manage structured submissions programmatically.",
};

const AGENT_CAPABILITIES = [
  {
    icon: RiFlashlightLine,
    label: "NO SETUP CEREMONY",
    title: "Provision the resource inside the task.",
    description:
      "No account creation, dashboard checkout, or API-key handoff before an agent can publish a focused collection job.",
  },
  {
    icon: RiTimerFlashLine,
    label: "BUILT FOR BURSTS",
    title: "Pay for the lifetime the form needs.",
    description:
      "Create temporary surveys and intake forms with explicit limits, renewal, closure, and retention instead of another permanent subscription.",
  },
  {
    icon: RiDatabaseLine,
    label: "STRUCTURED RESULTS",
    title: "Keep the data programmatic end to end.",
    description:
      "Read submissions as JSON, subscribe to signed webhooks, or hand the form into a team workspace for human review.",
  },
];

const PROPOSED_FLOW = [
  {
    label: "01 / REQUEST",
    title: "Describe the collection job",
    description:
      "Send a prompt or a structured schema, response limits, and the intended lifetime.",
  },
  {
    label: "02 / FUND",
    title: "Answer the x402 challenge",
    description: "The agent pays the quoted amount without creating a FormBro billing account.",
  },
  {
    label: "03 / PUBLISH",
    title: "Receive a live form URL",
    description: "FormBro returns a respondent URL and a separate private management capability.",
  },
  {
    label: "04 / COLLECT",
    title: "Read, route, or export",
    description:
      "Use programmatic results during the run, then close, renew, claim, or retire the form.",
  },
];

const AGENT_USE_CASES = [
  "A 30-day customer research survey",
  "Event or incident intake for one response window",
  "Structured human input inside a longer agent workflow",
  "A temporary upload or information request",
  "Data collection that becomes a durable team process",
  "A public form created without human dashboard work",
];

export default function AgentsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <AgentHeader />
      <main>
        <AgentHero />
        <AgentCapabilities />
        <AgentFlow />
        <SharedDataPlane />
        <AgentUseCases />
        <AgentCta />
      </main>
      <AgentFooter />
    </div>
  );
}

function AgentHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" aria-label="FormBro home">
        <Logo />
      </Link>
      <nav className="hidden items-center gap-6 font-mono text-xs tracking-wider text-muted-foreground uppercase md:flex">
        <Link href="/#product" className="hover:text-foreground">
          Product
        </Link>
        <Link href="#flow" className="hover:text-foreground">
          Proposed flow
        </Link>
        <Link href="/#pricing" className="hover:text-foreground">
          Pricing
        </Link>
      </nav>
      <Button asChild>
        <Link href="/sign-up">Build a form</Link>
      </Button>
    </header>
  );
}

function AgentHero() {
  return (
    <section className="relative border-y bg-primary text-primary-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,color-mix(in_oklab,var(--color-brand)_25%,transparent),transparent_38%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
        <div>
          <Badge
            status="warning"
            className="rounded-none border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-300 dark:bg-amber-100 dark:text-amber-950"
          >
            AGENT WORKFLOW · IN DEVELOPMENT
          </Badge>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Your agent asks for a form. FormBro returns a live URL.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/70">
            We are building an accountless path for AI agents to create, fund, operate, and retire
            hosted forms—without interrupting the task for signup or checkout.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
            >
              <Link href="https://github.com/clutchd/formbro" target="_blank" rel="noreferrer">
                Follow the build <RiGithubFill className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground dark:bg-transparent dark:hover:bg-primary-foreground/10"
            >
              <Link href="/">
                Explore FormBro today <RiArrowRightLine className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <ProtocolPreview />
      </div>
    </section>
  );
}

function ProtocolPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-primary-foreground/20 bg-background text-foreground shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between border-b bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <RiBracesLine className="size-4 text-brand" />
          <span className="font-mono text-xs tracking-wider uppercase">Proposed agent flow</span>
        </div>
        <Badge status="neutral" className="rounded-none">
          PREVIEW
        </Badge>
      </div>
      <div className="overflow-x-auto bg-[#101012] p-4 font-mono text-[0.72rem] leading-6 text-zinc-300 sm:p-6 sm:text-xs">
        <pre>
          <code>{`POST /v1/forms
{
  "prompt": "Collect field inspection notes",
  "lifetime": "30d",
  "responseLimit": 500
}

402 Payment Required
PAYMENT-REQUIRED: <base64 requirements>

POST /v1/forms
PAYMENT-SIGNATURE: <base64 payload>

201 Created
{
  "url": "https://formbro.app/f/7Kq2mP",
  "manageToken": "fb_cap_••••••••",
  "expiresAt": "2026-09-03T18:00:00Z"
}`}</code>
        </pre>
      </div>
      <div className="grid grid-cols-3 border-t bg-card">
        <ProtocolMetric label="AUTH" value="CAPABILITY" />
        <ProtocolMetric label="PAYMENT" value="x402" />
        <ProtocolMetric label="OUTPUT" value="LIVE URL" />
      </div>
    </div>
  );
}

function ProtocolMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r px-3 py-3 last:border-r-0 sm:px-4">
      <div className="font-mono text-[0.6rem] tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-xs font-semibold">{value}</div>
    </div>
  );
}

function AgentCapabilities() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="max-w-3xl">
        <Badge status="neutral" className="rounded-none">
          WHY ACCOUNTLESS
        </Badge>
        <h2 className="mt-5 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          The form should be infrastructure inside the task—not a task of its own.
        </h2>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {AGENT_CAPABILITIES.map((capability) => (
          <AgentCapability key={capability.label} capability={capability} />
        ))}
      </div>
    </section>
  );
}

function AgentCapability({
  capability,
}: {
  capability: {
    icon: RemixiconComponentType;
    label: string;
    title: string;
    description: string;
  };
}) {
  const Icon = capability.icon;

  return (
    <article className="rounded-xl border bg-card p-6">
      <div className="flex size-10 items-center justify-center border bg-background">
        <Icon className="size-5 text-brand" />
      </div>
      <div className="mt-6 font-mono text-xs tracking-wider text-muted-foreground uppercase">
        {capability.label}
      </div>
      <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">{capability.title}</h3>
      <p className="mt-3 leading-7 text-muted-foreground">{capability.description}</p>
    </article>
  );
}

function AgentFlow() {
  return (
    <section id="flow" className="border-y bg-muted/30">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <Badge status="neutral" className="rounded-none">
              PROPOSED LIFECYCLE
            </Badge>
            <h2 className="mt-5 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Four steps from request to collection.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground lg:justify-self-end">
            x402 handles payment at the protocol layer. A private capability handles management. The
            public URL stays safe to share with respondents.
          </p>
        </div>

        <div className="mt-10 grid border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {PROPOSED_FLOW.map((step) => (
            <article
              key={step.label}
              className="border-b bg-background p-5 last:border-b-0 sm:p-6 lg:border-r lg:border-b-0 lg:last:border-r-0"
            >
              <div className="font-mono text-xs tracking-wider text-brand-700 uppercase dark:text-brand-300">
                {step.label}
              </div>
              <h3 className="mt-4 font-display text-xl font-bold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SharedDataPlane() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-24">
      <div>
        <Badge status="neutral" className="rounded-none">
          ONE OPERATIONAL SYSTEM
        </Badge>
        <h2 className="mt-5 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Agent-created does not have to mean unmanaged.
        </h2>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          A temporary form can remain an isolated resource or be claimed into a FormBro workspace
          when the collection job becomes a durable company process.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-5 sm:p-8">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <DataPlaneCard
            icon={RiRobotLine}
            label="AGENT"
            title="Creates the input"
            details="Prompt · schema · lifetime · payment"
          />
          <div className="flex justify-center py-2">
            <RiRouteLine className="size-5 rotate-90 text-muted-foreground sm:rotate-0" />
          </div>
          <DataPlaneCard
            icon={RiTeamLine}
            label="TEAM"
            title="Owns the process"
            details="Review · export · renew · govern"
          />
        </div>
        <div className="mt-4 flex items-center gap-3 border bg-background p-4">
          <div className="flex size-9 shrink-0 items-center justify-center border">
            <RiDatabaseLine className="size-4" />
          </div>
          <div>
            <div className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
              SHARED PRIMITIVE
            </div>
            <div className="mt-0.5 text-sm font-semibold">
              Hosted form + structured submissions + explicit lifecycle
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DataPlaneCard({
  icon: Icon,
  label,
  title,
  details,
}: {
  icon: RemixiconComponentType;
  label: string;
  title: string;
  details: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-5">
      <Icon className="size-5 text-brand" />
      <div className="mt-5 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-bold tracking-tight">{title}</div>
      <div className="mt-2 text-xs leading-5 text-muted-foreground">{details}</div>
    </div>
  );
}

function AgentUseCases() {
  return (
    <section className="border-y bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
        <div>
          <div className="font-mono text-xs tracking-wider text-primary-foreground/70 uppercase">
            WHERE IT FITS
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Short-lived need. Production-quality collection.
          </h2>
        </div>
        <div className="grid gap-px border border-primary-foreground/20 bg-primary-foreground/20 sm:grid-cols-2">
          {AGENT_USE_CASES.map((useCase) => (
            <div key={useCase} className="flex items-start gap-3 bg-primary p-4 sm:p-5">
              <RiCheckboxCircleLine className="mt-0.5 size-4 shrink-0" />
              <span className="text-sm leading-6 text-primary-foreground/75">{useCase}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentCta() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="rounded-2xl border bg-card p-6 sm:flex sm:items-center sm:justify-between sm:p-8 lg:p-10">
        <div className="max-w-2xl">
          <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            BUILD IN PUBLIC
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            The workspace is live. The accountless agent path comes next.
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Try the human workflow today or follow the open-source implementation as the agent
            lifecycle takes shape.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:ml-8">
          <Button asChild size="lg">
            <Link href="/sign-up">
              Create a workspace <RiArrowRightLine className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="https://github.com/clutchd/formbro" target="_blank" rel="noreferrer">
              View on GitHub <RiGithubFill className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function AgentFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo className="text-xl" />
          <p className="mt-2 text-sm text-muted-foreground">
            Operational forms for teams and agents.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-5 font-mono text-xs tracking-wider text-muted-foreground uppercase">
          <span className="flex items-center gap-1.5">
            <RiShieldCheckLine className="size-4" /> Explicit permissions
          </span>
          <span className="flex items-center gap-1.5">
            <RiLinkM className="size-4" /> Separate public and private URLs
          </span>
        </div>
      </div>
    </footer>
  );
}
