import type { Metadata } from "next";
import { authCallbackURL, authHref } from "@/lib/auth/callback-url";
import { Auth } from "../auth";

export const metadata: Metadata = {
  alternates: {
    canonical: "/sign-up",
  },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string | string[] }>;
}) {
  const callbackURL = authCallbackURL((await searchParams).callbackURL);

  return (
    <Auth
      title="Create your account"
      subtitle="Get started in seconds"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref={authHref("/sign-in", callbackURL)}
      callbackURL={callbackURL}
    />
  );
}
