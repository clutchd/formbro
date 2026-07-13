import type { Metadata } from "next";
import { APP_NAME, APP_URL } from "@formbro/shared/brand";
import { Badge } from "@formbro/ui/badge";
import { Button } from "@formbro/ui/button";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiRouteLine,
} from "@remixicon/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TemplateCta } from "@/components/marketing/template-cta";
import { FORM_TEMPLATES, getFormTemplate, type FormTemplate } from "@/content/form-templates";

export const dynamicParams = false;

type TemplatePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return FORM_TEMPLATES.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getFormTemplate(slug);

  if (!template) return {};

  const canonical = `/templates/${template.slug}`;
  return {
    title: template.seoTitle,
    description: template.metaDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      title: `${template.seoTitle} | ${APP_NAME}`,
      description: template.metaDescription,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: `${template.seoTitle} | ${APP_NAME}`,
      description: template.metaDescription,
    },
  };
}

function getRelatedTemplates(template: FormTemplate) {
  return template.relatedSlugs.flatMap((slug) => {
    const relatedTemplate = getFormTemplate(slug);
    return relatedTemplate ? [relatedTemplate] : [];
  });
}

function getStructuredData(template: FormTemplate) {
  const pageUrl = new URL(`/templates/${template.slug}`, APP_URL).toString();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: template.seoTitle,
        description: template.metaDescription,
        url: pageUrl,
        isPartOf: {
          "@type": "WebSite",
          name: APP_NAME,
          url: APP_URL,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: APP_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Templates",
            item: new URL("/templates", APP_URL).toString(),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: template.name,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: template.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

function TemplatePreview({ template }: { template: FormTemplate }) {
  return (
    <div
      id="template-preview"
      className="scroll-mt-24 rounded-2xl border bg-card shadow-xl shadow-black/5"
    >
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <div className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
            Template preview
          </div>
          <div className="mt-1 font-display text-lg font-bold tracking-tight">{template.name}</div>
        </div>
        <Badge status="success" className="rounded-none">
          Ready to edit
        </Badge>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        {template.fields.slice(0, 5).map((field) => (
          <div key={field.label}>
            <div className="flex items-center gap-2 text-sm font-medium">
              {field.label}
              {field.required ? (
                <span className="font-mono text-[0.6rem] tracking-wider text-muted-foreground uppercase">
                  Required
                </span>
              ) : null}
            </div>
            <div
              aria-hidden="true"
              className="mt-2 h-10 rounded-md border bg-background shadow-xs"
            />
          </div>
        ))}
        <div
          aria-hidden="true"
          className="flex h-10 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground"
        >
          Submit
        </div>
      </div>
    </div>
  );
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { slug } = await params;
  const template = getFormTemplate(slug);

  if (!template) notFound();

  const relatedTemplates = getRelatedTemplates(template);
  const structuredData = getStructuredData(template);

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c"),
        }}
      />

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-5 pt-6 pb-16 sm:px-8 lg:pb-24">
          <nav aria-label="Breadcrumb" className="font-mono text-xs tracking-wider uppercase">
            <Link
              href="/templates"
              className="inline-flex items-center gap-1 rounded-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <RiArrowLeftLine aria-hidden="true" className="size-4" />
              All templates
            </Link>
          </nav>

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-center">
            <div>
              <Badge status="neutral" className="rounded-none">
                {template.eyebrow}
              </Badge>
              <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.98] font-bold tracking-tight text-balance sm:text-6xl">
                {template.headline}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-muted-foreground">
                {template.introduction}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <TemplateCta location="template_detail_hero" templateSlug={template.slug} />
                <Button asChild variant="outline" size="lg">
                  <Link href="#template-preview">Preview fields</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                <span>{template.fields.length} recommended fields</span>
                <span>Fully customizable</span>
                <span>7-day trial</span>
              </div>
            </div>
            <TemplatePreview template={template} />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="included-fields-heading"
        className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:py-24"
      >
        <div>
          <div className="font-mono text-xs tracking-wider text-brand uppercase">Field guide</div>
          <h2
            id="included-fields-heading"
            className="mt-3 scroll-mt-24 font-display text-4xl font-bold tracking-tight text-balance"
          >
            What this template captures
          </h2>
          <p className="mt-4 leading-7 text-pretty text-muted-foreground">
            Start with a focused set of questions. Remove anything that does not change the next
            step.
          </p>
        </div>
        <div className="grid gap-3">
          {template.fields.map((field, index) => (
            <article
              key={field.label}
              className="grid gap-4 border-t py-5 sm:grid-cols-[2rem_12rem_1fr]"
            >
              <div className="font-mono text-xs tracking-wider text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display text-lg font-bold tracking-tight">{field.label}</h3>
              <p className="leading-7 text-muted-foreground">{field.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-2xl">
            <div className="font-mono text-xs tracking-wider text-brand uppercase">
              From response to action
            </div>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance">
              A form designed around the handoff
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {template.workflow.map((step, index) => (
              <article key={step.title} className="rounded-2xl border bg-background p-6">
                <div className="flex items-center justify-between">
                  <RiRouteLine aria-hidden="true" className="size-5 text-brand" />
                  <span className="font-mono text-xs tracking-wider text-muted-foreground tabular-nums">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-8 font-display text-2xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
        <div>
          <div className="font-mono text-xs tracking-wider text-brand uppercase">Best for</div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance">
            Teams running this workflow every week
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {template.audiences.map((audience) => (
              <Badge key={audience} status="neutral" className="rounded-none">
                {audience}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <div className="font-mono text-xs tracking-wider text-brand uppercase">What improves</div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance">
            Less cleanup after every submission
          </h2>
          <ul className="mt-6 grid gap-3">
            {template.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                <RiCheckboxCircleLine aria-hidden="true" className="size-5 shrink-0 text-brand" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="font-mono text-xs tracking-wider text-brand uppercase">
            Frequently asked questions
          </div>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance">
            Build a better {template.name.toLowerCase()}
          </h2>
          <div className="mt-8 divide-y border-y">
            {template.faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="cursor-pointer rounded-sm font-display text-lg font-bold tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  {faq.question}
                </summary>
                <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="font-mono text-xs tracking-wider text-brand uppercase">
              Keep improving the workflow
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
              Related form templates
            </h2>
          </div>
          <Link
            href="/templates"
            className="inline-flex w-fit items-center gap-1 rounded-sm text-sm font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Browse all templates
            <RiArrowRightLine aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {relatedTemplates.map((relatedTemplate) => (
            <Link
              key={relatedTemplate.slug}
              href={`/templates/${relatedTemplate.slug}`}
              className="group rounded-2xl border bg-card p-6 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                {relatedTemplate.category}
              </div>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">
                {relatedTemplate.name}
              </h3>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium">
                View template
                <RiArrowRightLine
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-mono text-xs tracking-wider text-primary-foreground/65 uppercase">
              Your workflow, your fields
            </div>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold tracking-tight text-balance">
              Make this template fit the way your team works.
            </h2>
          </div>
          <TemplateCta location="template_detail_bottom" templateSlug={template.slug} />
        </div>
      </section>
    </main>
  );
}
