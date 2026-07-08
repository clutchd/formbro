import { authCallbackURL, authHref } from "@/lib/auth/callback-url";
import { Auth } from "../auth";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string | string[] }>;
}) {
  const callbackURL = authCallbackURL((await searchParams).callbackURL);

  return (
    <Auth
      title="Create your account"
      subtitle="Start with Google or Microsoft"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref={authHref("/sign-in", callbackURL)}
      callbackURL={callbackURL}
      supportingText={
        "No credit card to create an account. Start a 7-day trial when you are ready to publish."
      }
    />
  );
}
