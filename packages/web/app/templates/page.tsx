import type { Metadata } from "next";
import { APP_URL } from "@formbro/shared/brand";
import { Badge } from "@formbro/ui/badge";
import { RiArrowRightLine, RiCheckboxCircleLine } from "@remixicon/react";
import Link from "next/link";
import { TemplateCta } from "@/components/marketing/template-cta";
import { FORM_TEMPLATES } from "@/content/form-templates";

export const metadata: Metadata = {
  title: "Form Templates for Serious Workflows",
  description:
    "Start with practical form templates for client intake, service requests, vendor onboarding, and event registration. Customize every field in FormBro.",
  alternates: {
    canonical: "/templates",
  },
  openGraph: {
    title: "Form Templates for Serious Workflows",
    description:
      "Practical, customizable templates for intake, operations, onboarding, and registration.",
    url: "/templates",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "FormBro Form Templates",
  description:
    "Practical form templates for client intake, service requests, vendor onboarding, and event registration.",
  url: new URL("/templates", APP_URL).toString(),
  mainEntity: {
    "@type": "ItemList",
    itemListElement: FORM_TEMPLATES.map((template, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: template.name,
      url: new URL(`/templates/${template.slug}`, APP_URL).toString(),
    })),
  },
};

export default function TemplatesPage() {
  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c"),
        }}
      />

      <section className="border-b bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_22rem] lg:items-end lg:py-24">
          <div>
            <Badge status="neutral" className="rounded-none">
              Workflow templates
            </Badge>
            <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.98] font-bold tracking-tight text-balance sm:text-6xl">
              Start with the questions your workflow needs.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-muted-foreground">
              Use a focused template, make it yours, and publish a form built for a real handoff—not
              a generic survey.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              Included with every template
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                "Practical field defaults",
                "Clear workflow structure",
                "Fully editable in FormBro",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <RiCheckboxCircleLine aria-hidden="true" className="size-4 shrink-0 text-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="template-library-heading"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20"
      >
        <div className="mb-8 max-w-2xl">
          <div className="font-mono text-xs tracking-wider text-brand uppercase">
            Template library
          </div>
          <h2
            id="template-library-heading"
            className="mt-3 scroll-mt-24 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl"
          >
            Pick the handoff you want to improve.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {FORM_TEMPLATES.map((template) => (
            <Link
              key={template.slug}
              href={`/templates/${template.slug}`}
              className="group flex min-h-72 flex-col rounded-2xl border bg-card p-6 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:p-8"
            >
              <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                {template.category}
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance">
                {template.name}
              </h2>
              <p className="mt-3 line-clamp-3 leading-7 text-pretty text-muted-foreground">
                {template.introduction}
              </p>
              <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                  {template.fields.length} recommended fields
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-medium">
                  View template
                  <RiArrowRightLine
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-mono text-xs tracking-wider text-primary-foreground/65 uppercase">
              Build the real workflow
            </div>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold tracking-tight text-balance">
              Customize a template and publish in minutes.
            </h2>
          </div>
          <TemplateCta location="template_hub_bottom" />
        </div>
      </section>
    </main>
  );
}
