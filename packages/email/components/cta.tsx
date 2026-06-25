import { Button, Section } from "@react-email/components";
import React from "react";

export function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Section className="mt-10 text-center">
      <Button
        className="dark:bg-primary-dark dark:text-primary-foreground-dark inline-block rounded-md bg-primary px-5 py-2.5 text-center text-sm leading-5 font-semibold whitespace-nowrap text-primary-foreground no-underline"
        href={href}
      >
        {children}
      </Button>
    </Section>
  );
}
