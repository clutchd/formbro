import type { Metadata } from "next";
import { APP_NAME } from "@formbro/shared/brand";
import { notFound } from "next/navigation";
import {
  getTemplateCategoryPage,
  listTemplates,
  TEMPLATE_CATEGORIES,
  templateCategoryPath,
} from "@/templates";
import { LandingPage } from "../../../../landing-chrome";
import { TemplatesGallery } from "../../templates-gallery";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return TEMPLATE_CATEGORIES.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getTemplateCategoryPage(slug);
  if (!page) return { title: `Form templates | ${APP_NAME}` };

  const count = listTemplates({ category: page.slug }).length;
  return {
    title: `${page.metaTitle} | ${APP_NAME}`,
    description: page.metaDescription,
    alternates: { canonical: templateCategoryPath(page.slug) },
    openGraph: {
      title: `${count}+ ${page.heading} | ${APP_NAME}`,
      description: page.metaDescription,
    },
  };
}

export default async function TemplateCategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const page = getTemplateCategoryPage(slug);
  if (!page) notFound();

  const templates = listTemplates({ category: page.slug });

  return (
    <LandingPage>
      <TemplatesGallery
        templates={templates}
        heading={page.heading}
        intro={page.intro}
        activeCategory={page.slug}
        about={page.about}
        useCases={page.useCases}
      />
    </LandingPage>
  );
}
