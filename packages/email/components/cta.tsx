import { Button, Section } from "@react-email/components";
import React from "react";

export function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Section className="mt-10 text-center">
      <Button
        className="dark:bg-primary-dark dark:text-primary-foreground-dark inline-block rounded-md bg-primary px-3 py-1.5 text-center text-sm leading-5 font-medium whitespace-nowrap text-primary-foreground no-underline"
        href={href}
      >
        {children}
      </Button>
    </Section>
  );
}
