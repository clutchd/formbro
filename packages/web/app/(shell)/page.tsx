import type { Metadata } from "next";
import { APP_DESCRIPTION } from "@formbro/shared/brand";
import { parseFormAcquisitionContext } from "@/lib/form-acquisition";
import { HomePage } from "../home-page";

export const metadata: Metadata = {
  title: "FormBro | Serious forms without the enterprise tax",
  description: APP_DESCRIPTION,
};

type HomeSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: { searchParams: Promise<HomeSearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const acquisitionContext = parseFormAcquisitionContext({
    formName: firstParam(resolvedSearchParams.ref_name),
    formSlug: firstParam(resolvedSearchParams.ref_form),
    source: firstParam(resolvedSearchParams.utm_source),
  });

  return <HomePage acquisitionContext={acquisitionContext} />;
}
