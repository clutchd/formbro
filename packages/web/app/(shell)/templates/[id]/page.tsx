import type { Metadata } from "next";
import { APP_NAME } from "@formbro/shared/brand";
import { twx } from "@formbro/shared/twx";
import { tuiFont } from "@formbro/ui/typography";
import { RiArrowLeftLine } from "@remixicon/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getTemplate,
  listTemplates,
  templateCategoryLabel,
  templateCategoryPath,
  templateIdFromSlug,
  templatePageDescription,
  templatePageTitle,
  templatePath,
  templateSlug,
} from "@/templates";
import { LandingPage } from "../../../landing-chrome";
import { TemplateCreatedCount, TemplatePreview, TemplateUseCta } from "./template-preview";

type TemplatePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ use?: string | string[] }>;
};

export function generateStaticParams() {
  return listTemplates().map((template) => ({ id: templateSlug(template.id) }));
}

export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
  const { id } = await params;
  const template = getTemplate(templateIdFromSlug(id));
  if (!template) return { title: "Form templates" };

  const title = templatePageTitle(template.name);
  const description = templatePageDescription(template);

  return {
    title,
    description,
    alternates: { canonical: templatePath(template.id) },
    openGraph: {
      title: `${title} | ${APP_NAME}`,
      description,
      url: templatePath(template.id),
    },
  };
}

export default async function TemplateDetailPage({ params, searchParams }: TemplatePageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const template = getTemplate(templateIdFromSlug(id));
  if (!template) notFound();

  const related = listTemplates({ category: template.category }).filter(
    (card) => card.id !== template.id,
  );
  const useParam = Array.isArray(query.use) ? query.use[0] : query.use;
  const title = templatePageTitle(template.name);

  return (
    <LandingPage>
      <article>
        <div className="border-y bg-muted/40 bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-size-[32px_32px]">
          <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase"
            >
              <Link
                href="/templates"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <RiArrowLeftLine className="size-3.5" />
                Templates
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                href={templateCategoryPath(template.category)}
                className="hover:text-foreground"
              >
                {templateCategoryLabel(template.category)}
              </Link>
            </nav>

            <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(28rem,1.2fr)] lg:gap-12">
              <header className="max-w-xl lg:pt-10">
                <p className={twx(tuiFont, "text-muted-foreground")}>
                  {templateCategoryLabel(template.category)}
                  {template.pageCount > 1 ? ` · ${template.pageCount} pages` : ""} ·{" "}
                  {template.fieldCount} fields
                  <TemplateCreatedCount templateId={template.id} />
                </p>
                <h1 className="mt-3 font-display text-4xl leading-[0.95] font-bold tracking-tight text-balance sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-5 max-w-lg text-lg text-pretty text-muted-foreground">
                  {template.description}
                </p>
                <div className="mt-7">
                  <TemplateUseCta
                    templateId={template.id}
                    templateVersion={template.version}
                    name={template.name}
                    schema={template.schema}
                    autoUse={useParam === "1"}
                  />
                </div>
              </header>

              <section aria-labelledby="template-preview-heading" className="min-w-0">
                <h2
                  id="template-preview-heading"
                  className={twx(tuiFont, "mb-3 text-muted-foreground")}
                >
                  Live form preview
                </h2>
                <div className="w-full rounded-xl border bg-background p-6 shadow-xl sm:p-8">
                  <TemplatePreview schema={template.schema} />
                </div>
              </section>
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mx-auto w-full max-w-7xl px-5 pt-12 pb-20 sm:px-8">
            <h2 className="font-display text-xl font-bold tracking-tight">Related templates</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {related.slice(0, 3).map((card) => (
                <Link
                  key={card.id}
                  href={templatePath(card.id)}
                  className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <h3 className="font-display font-bold tracking-tight">{card.name}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{card.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="h-16" />
        )}
      </article>
    </LandingPage>
  );
}
