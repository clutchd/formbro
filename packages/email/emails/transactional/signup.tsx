import { APP_URL, TAGLINE } from "@formbro/shared/brand";
import { Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import Card from "../../components/card";
import { CTA } from "../../components/cta";
import Tailwind, { type Theme } from "../../components/tailwind";

export function SignupSubject() {
  return "Welcome to FormBro";
}

type SignupProps = {
  theme?: Theme;
};

export default function SignupComponent({ theme = "system" }: SignupProps = {}) {
  return (
    <Html>
      <Tailwind mode={theme}>
        <Head>
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
        </Head>
        <Preview>
          Your FormBro workspace is ready. Create, publish, and manage your first form in minutes.
        </Preview>
        <Card utmMedium="signup">
          <Section>
            <Text className="dark:text-muted-foreground-dark m-0 font-mono text-xs tracking-wider text-muted-foreground uppercase">
              Workspace ready
            </Text>
            <Heading className="mx-0 mt-3 mb-0 p-0 text-3xl font-bold">Welcome to FormBro</Heading>
            <Text className="dark:text-muted-foreground-dark mt-3 mb-0 text-base leading-7 text-muted-foreground">
              {TAGLINE}
            </Text>
          </Section>

          <Section className="mt-8">
            <Text className="m-0 text-base leading-7">
              Your dashboard is ready. Build a form, publish it, and start collecting responses
              without turning a simple workflow into a project.
            </Text>
            <Text className="dark:text-muted-foreground-dark mt-5 mb-0 text-sm leading-6 text-muted-foreground">
              Start with a clean form, share the link, and keep submissions organized in one place.
            </Text>
          </Section>

          <CTA href={`${APP_URL}/dashboard`}>Go to your dashboard</CTA>
        </Card>
      </Tailwind>
    </Html>
  );
}

SignupComponent.PreviewProps = {
  theme: "system",
} satisfies SignupProps;
