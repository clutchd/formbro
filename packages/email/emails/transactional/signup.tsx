import { APP_URL } from "@formbro/shared/brand";
import { Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import React from "react";
import Card from "../../components/card";
import { CTA } from "../../components/cta";
import Tailwind from "../../components/tailwind";

export default function Signup() {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Welcome to FormBro</Preview>
        <Card utmMedium="signup">
          <Section className="text-center">
            <Text className="dark:text-muted-foreground-dark m-0 font-mono text-xs tracking-wider text-muted-foreground uppercase">
              You're in
            </Text>
            <Heading className="mx-0 mt-3 mb-0 p-0 text-3xl font-bold">Welcome to FormBro</Heading>
          </Section>

          <Section className="mt-8 text-center">
            <Text className="m-0 text-base leading-7">
              Thank you for signing up! Your dashboard is ready - and your first form is just{" "}
              <span className="italic underline">seconds</span> away.
            </Text>
          </Section>

          <CTA href={`${APP_URL}/dashboard`}>Go to your dashboard</CTA>
        </Card>
      </Tailwind>
    </Html>
  );
}
