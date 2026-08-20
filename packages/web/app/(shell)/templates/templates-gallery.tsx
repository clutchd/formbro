"use client";

import { twx } from "@formbro/shared/twx";
import { Badge } from "@formbro/ui/badge";
import { Input } from "@formbro/ui/input";
import { tuiFont } from "@formbro/ui/typography";
import { RiArrowRightLine, RiFileTextLine } from "@remixicon/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_INDUSTRIES,
  templateCategoryLabel,
  templateCategoryPath,
  templateIndustryLabel,
  templateIndustryPath,
  templatePath,
  type TemplateCard,
  type TemplateCategory,
  type TemplateIndustry,
} from "@/templates";

function chipClassName(active: boolean) {
  return twx(
    "inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium",
    active
      ? "border-transparent bg-primary text-primary-foreground"
      : "border-border bg-background hover:bg-accent",
  );
}

export function TemplatesGallery({
  templates,
  heading,
  intro,
  activeCategory,
  activeIndustry,
  about,
  useCases,
}: {
  templates: TemplateCard[];
  heading: string;
  intro: string;
  activeCategory?: TemplateCategory;
  activeIndustry?: TemplateIndustry;
  about?: { heading: string; body: string };
  useCases?: string[];
}) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return templates;
    return templates.filter((template) =>
      [template.name, template.description, ...template.categories, ...template.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, templates]);

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-10 pb-20 sm:px-8">
      <div className="max-w-3xl">
        <p className={twx(tuiFont, "text-muted-foreground")}>
          {templates.length} template{templates.length === 1 ? "" : "s"}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[0.95] font-bold tracking-tight text-balance sm:text-5xl">
          {heading}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{intro}</p>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-start">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search templates"
          aria-label="Search templates"
          className="sm:max-w-xs"
        />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={twx(tuiFont, "mr-1 text-muted-foreground")}>Workflow</span>
            <nav aria-label="Template categories" className="flex flex-wrap gap-1.5">
              <Link href="/templates" className={chipClassName(!activeCategory && !activeIndustry)}>
                All
              </Link>
              {TEMPLATE_CATEGORIES.map((item) => (
                <Link
                  key={item}
                  href={templateCategoryPath(item)}
                  className={chipClassName(activeCategory === item)}
                >
                  {templateCategoryLabel(item)}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={twx(tuiFont, "mr-1 text-muted-foreground")}>Industry</span>
            <nav aria-label="Template industries" className="flex flex-wrap gap-1.5">
              {TEMPLATE_INDUSTRIES.map((item) => (
                <Link
                  key={item}
                  href={templateIndustryPath(item)}
                  className={chipClassName(activeIndustry === item)}
                >
                  {templateIndustryLabel(item)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((template) => (
          <Link
            key={template.id}
            href={templatePath(template.id)}
            className="flex rounded-lg border bg-card p-5 transition-colors hover:bg-accent"
          >
            <span className="flex size-9 shrink-0 items-center justify-center border">
              <RiFileTextLine className="size-4 text-muted-foreground" />
            </span>
            <span className="ml-3 min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate font-display text-lg font-bold tracking-tight">
                  {template.name}
                </span>
                {template.featured ? (
                  <Badge variant="outline" className="rounded-none">
                    Featured
                  </Badge>
                ) : null}
              </span>
              <span className="mt-2 block text-sm text-muted-foreground">
                {template.description}
              </span>
              <span className={twx(tuiFont, "mt-3 block text-muted-foreground")}>
                {templateCategoryLabel(template.category)} · {template.fieldCount} fields
                {template.pageCount > 1 ? ` · ${template.pageCount} pages` : ""}
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                Preview <RiArrowRightLine className="size-4" />
              </span>
            </span>
          </Link>
        ))}
      </div>

      {about ? (
        <section className="mt-16 max-w-3xl border-t pt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">{about.heading}</h2>
          <p className="mt-4 text-muted-foreground">{about.body}</p>
          {useCases && useCases.length > 0 ? (
            <>
              <h3 className="mt-8 font-display text-xl font-bold tracking-tight">Use cases</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                {useCases.map((useCase) => (
                  <li key={useCase}>{useCase}</li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
