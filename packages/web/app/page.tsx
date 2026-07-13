import type { Metadata } from "next";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "@formbro/shared/brand";
import { getToken } from "@/lib/auth/server";
import { ConvexProvider } from "@/lib/convex/client";
import { AnonymousHomePage, AuthenticatedHomePage } from "./home-page";

export const metadata: Metadata = {
  title: {
    absolute: "FormBro | Serious forms without the enterprise tax",
  },
  description: APP_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FormBro | Serious forms without the enterprise tax",
    description: APP_DESCRIPTION,
    url: "/",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: APP_NAME,
      url: APP_URL,
      description: APP_DESCRIPTION,
    },
    {
      "@type": "SoftwareApplication",
      name: APP_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: APP_DESCRIPTION,
      url: APP_URL,
      offers: [
        {
          "@type": "Offer",
          name: "Basic",
          price: "10",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "25",
          priceCurrency: "USD",
        },
      ],
    },
  ],
};

export default async function Home() {
  const token = await getToken();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c"),
        }}
      />
      {token ? (
        <ConvexProvider token={token}>
          <AuthenticatedHomePage />
        </ConvexProvider>
      ) : (
        <AnonymousHomePage />
      )}
    </>
  );
}
