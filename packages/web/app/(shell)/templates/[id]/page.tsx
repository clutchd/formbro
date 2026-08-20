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
  templatePath,
  templateSlug,
} from "@/templates";
import { LandingPage } from "../../../landing-chrome";
import { TemplatePreview, TemplateUseCta } from "./template-preview";

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
  if (!template) return { title: `Form templates | ${APP_NAME}` };

  return {
    title: `${template.name} | ${APP_NAME}`,
    description: template.description,
    alternates: { canonical: templatePath(template.id) },
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

  return (
    <LandingPage>
      <article>
        <div className="mx-auto w-full max-w-7xl px-5 pt-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
            <TemplateUseCta
              templateId={template.id}
              templateVersion={template.version}
              name={template.name}
              schema={template.schema}
              autoUse={useParam === "1"}
            />
          </div>

          <header className="mx-auto mt-8 max-w-2xl text-center">
            <p className={twx(tuiFont, "text-muted-foreground")}>
              {templateCategoryLabel(template.category)}
              {template.pageCount > 1 ? ` · ${template.pageCount} pages` : ""} ·{" "}
              {template.fieldCount} fields
            </p>
            <h1 className="mt-2 font-display text-3xl leading-[0.95] font-bold tracking-tight text-balance sm:text-4xl">
              {template.name}
            </h1>
            <p className="mt-3 text-pretty text-muted-foreground">{template.description}</p>
          </header>
        </div>

        <div className="mt-10 border-y bg-muted/40 bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-size-[32px_32px] px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-lg rounded-xl border bg-background p-6 shadow-xl sm:p-8">
            <TemplatePreview schema={template.schema} />
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
