import { authCallbackURL, authHref } from "@/lib/auth/callback-url";
import { Auth } from "../auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string | string[] }>;
}) {
  const callbackURL = authCallbackURL((await searchParams).callbackURL);

  return (
    <Auth
      title="Welcome back"
      subtitle="Sign in to continue building"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref={authHref("/sign-up", callbackURL)}
      callbackURL={callbackURL}
    />
  );
}
