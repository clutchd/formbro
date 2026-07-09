import type { Metadata } from "next";
import { APP_DESCRIPTION } from "@formbro/shared/brand";
import { getToken } from "@/lib/auth/server";
import { ConvexProvider } from "@/lib/convex/client";
import { AnonymousHomePage, AuthenticatedHomePage } from "./home-page";

export const metadata: Metadata = {
  title: "FormBro | Serious forms without the enterprise tax",
  description: APP_DESCRIPTION,
};

export default async function Home() {
  const token = await getToken();

  if (!token) {
    return <AnonymousHomePage />;
  }

  return (
    <ConvexProvider token={token}>
      <AuthenticatedHomePage />
    </ConvexProvider>
  );
}
