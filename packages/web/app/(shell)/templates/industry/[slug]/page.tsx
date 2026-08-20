import type { Metadata } from "next";
import { APP_NAME } from "@formbro/shared/brand";
import { notFound } from "next/navigation";
import {
  getTemplateIndustryPage,
  listTemplates,
  TEMPLATE_INDUSTRIES,
  templateIndustryPath,
} from "@/templates";
import { LandingPage } from "../../../../landing-chrome";
import { TemplatesGallery } from "../../templates-gallery";

type IndustryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return TEMPLATE_INDUSTRIES.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getTemplateIndustryPage(slug);
  if (!page) return { title: `Form templates | ${APP_NAME}` };

  const count = listTemplates({ industry: page.slug }).length;
  return {
    title: `${page.metaTitle} | ${APP_NAME}`,
    description: page.metaDescription,
    alternates: { canonical: templateIndustryPath(page.slug) },
    openGraph: {
      title: `${count}+ ${page.heading} | ${APP_NAME}`,
      description: page.metaDescription,
    },
  };
}

export default async function TemplateIndustryPage({ params }: IndustryPageProps) {
  const { slug } = await params;
  const page = getTemplateIndustryPage(slug);
  if (!page) notFound();

  const templates = listTemplates({ industry: page.slug });

  return (
    <LandingPage>
      <TemplatesGallery
        templates={templates}
        heading={page.heading}
        intro={page.intro}
        activeIndustry={page.slug}
        about={page.about}
        useCases={page.useCases}
      />
    </LandingPage>
  );
}
