import type { Metadata } from "next";
import { APP_DESCRIPTION } from "@formbro/shared/brand";
import { HomePage } from "../home-page";

export const metadata: Metadata = {
  title: "FormBro | Serious forms without the enterprise tax",
  description: APP_DESCRIPTION,
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ utm_source?: string | string[] }>;
}) {
  const utmSource = (await searchParams).utm_source;
  const isFormReferral = (Array.isArray(utmSource) ? utmSource[0] : utmSource) === "form";

  return <HomePage isFormReferral={isFormReferral} />;
}
