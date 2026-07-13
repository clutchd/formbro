"use client";

import { Button } from "@formbro/ui/button";
import { RiArrowRightLine } from "@remixicon/react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";

export function TemplateCta({
  label = "Start 7-day trial",
  location,
  templateSlug,
}: {
  label?: string;
  location: string;
  templateSlug?: string;
}) {
  const posthog = usePostHog();

  return (
    <Button asChild size="lg">
      <Link
        href="/sign-up"
        onClick={() =>
          posthog.capture("marketing_cta_clicked", {
            audience: "anonymous",
            href: "/sign-up",
            label,
            location,
            page_type: "template",
            template_slug: templateSlug,
          })
        }
      >
        {label}
        <RiArrowRightLine aria-hidden="true" className="size-4" />
      </Link>
    </Button>
  );
}
