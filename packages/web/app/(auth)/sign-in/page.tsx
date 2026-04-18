import { Auth } from "../auth";

export default function SignInPage() {
  return (
    <Auth
      title="Welcome back"
      subtitle="Sign in to continue building"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref={`/sign-up`}
    />
  );
}
