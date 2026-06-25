import { Head, Heading, Html, Link, Preview, Section, Text } from "@react-email/components";
import React from "react";
import Card from "../../components/card";
import { CTA } from "../../components/cta";
import Tailwind, { type Theme } from "../../components/tailwind";

const APP_URL = "https://formbro.com";
const CAMPAIGN_URL = `${APP_URL}?utm_source=resend&utm_medium=broadcast&utm_campaign=relaunch`;
const UNSUBSCRIBE_URL = "{{{RESEND_UNSUBSCRIBE_URL}}}";
const FIRST_NAME = "{{{contact.first_name|there}}}";

export function RelaunchSubject() {
  return "Meet the new FormBro";
}

type RelaunchProps = {
  theme?: Theme;
};

export default function RelaunchEmail({ theme = "system" }: RelaunchProps = {}) {
  return (
    <Html>
      <Tailwind mode={theme}>
        <Head>
          <meta name="color-scheme" content="light dark" />
          <meta name="supported-color-schemes" content="light dark" />
        </Head>
        <Preview>A faster, cleaner FormBro for serious workflows.</Preview>
        <Card utmMedium="broadcast">
          <Section>
            <Text className="dark:text-muted-foreground-dark m-0 font-mono text-xs tracking-wider text-muted-foreground uppercase">
              Relaunch
            </Text>
            <Heading className="mx-0 mt-3 mb-0 p-0 text-3xl font-bold">
              Meet the new FormBro
            </Heading>
          </Section>

          <Section className="mt-8">
            <Text className="m-0 text-base leading-7">Hey {FIRST_NAME},</Text>
            <Text className="mt-5 mb-0 text-base leading-7">
              I rebuilt FormBro around the thing it was always supposed to be: a form platform for
              serious workflows that still feels fast, simple, and pleasant to use.
            </Text>
          </Section>

          <Section className="mt-7">
            <Text className="mt-0 mb-4 text-sm leading-6">
              <strong>Build faster:</strong> a cleaner builder, better defaults, and less ceremony
              between an idea and a live form.
            </Text>
            <Text className="mt-0 mb-4 text-sm leading-6">
              <strong>Publish without fuss:</strong> share forms quickly and keep the flow moving
              without configuration rabbit holes.
            </Text>
            <Text className="m-0 text-sm leading-6">
              <strong>Keep responses useful:</strong> submissions stay organized for real teams and
              real workflows, not throwaway questionnaires.
            </Text>
          </Section>

          <Text className="mt-7 mb-0 text-base leading-7">
            It is still early, but the shape is there. I would love for you to poke around, try the
            new flow, and tell me what feels sharp, slow, or annoying.
          </Text>

          <CTA href={CAMPAIGN_URL}>Try the new FormBro</CTA>

          <Text className="dark:text-muted-foreground-dark mt-7 mb-0 text-sm leading-6 text-muted-foreground">
            Thanks for being early. That still means something around here.
          </Text>

          <Text className="dark:text-muted-foreground-dark mt-8 mb-0 text-center text-xs leading-5 text-muted-foreground">
            You are receiving this because you signed up for FormBro updates.{" "}
            <Link
              className="dark:text-card-foreground-dark text-card-foreground underline"
              href={UNSUBSCRIBE_URL}
            >
              Unsubscribe
            </Link>
          </Text>
        </Card>
      </Tailwind>
    </Html>
  );
}

RelaunchEmail.PreviewProps = {
  theme: "system",
} satisfies RelaunchProps;
