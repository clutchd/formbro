import { APP_NAME, APP_URL, TAGLINE } from "@formbro/shared/brand";
import { Body, Container, Link, Section, Text } from "@react-email/components";
import React from "react";

export default function Card({
  children,
  utmMedium,
}: {
  utmMedium: string;
  children?: React.ReactNode;
}) {
  return (
    <Body className="dark:bg-background-dark dark:text-foreground-dark m-0 bg-background font-sans text-foreground">
      <Section className="dark:bg-background-dark w-full bg-background px-0 py-10">
        <Container className="mx-auto mb-6 max-w-[520px] px-8">
          <Text className="m-0 font-mono text-xs tracking-wider text-muted-foreground uppercase">
            {APP_NAME}
          </Text>
        </Container>

        <Container className="dark:text-card-foreground-dark dark:border-border-dark dark:bg-card-dark mx-auto max-w-[520px] rounded-xl border border-solid border-border bg-card px-10 py-12 text-card-foreground shadow-sm">
          {children}
        </Container>

        <Section className="mt-6 mb-10 text-center">
          <Link
            className="dark:text-muted-foreground-dark text-xs text-muted-foreground"
            href={`${APP_URL}?utm_source=email&utm_medium=${utmMedium}`}
          >
            <span className="font-bold">{APP_NAME}</span>
            <span className="mx-2">-</span>
            {TAGLINE}
          </Link>
        </Section>
      </Section>
    </Body>
  );
}
