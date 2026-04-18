import { Auth } from "../auth";

export default function SignUpPage() {
  return (
    <Auth
      title="Create your account"
      subtitle="Get started in seconds"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref={`/sign-in`}
    />
  );
}
