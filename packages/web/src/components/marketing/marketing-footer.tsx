import { TAGLINE } from "@formbro/shared/brand";
import { Logo } from "@formbro/ui/logo";
import Link from "next/link";

const footerLinks = [
  { href: "/templates", label: "Templates" },
  { href: "/#builder", label: "Builder" },
  { href: "/#pricing", label: "Pricing" },
  { href: "https://github.com/clutchd/formbro", label: "GitHub" },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo className="text-xl" />
          <p className="mt-2 text-sm text-muted-foreground">© 2026 Clutchd, LLC. {TAGLINE}</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {footerLinks.map((item) => {
            const isExternal = item.href.startsWith("https://");
            return (
              <Link
                key={item.href}
                href={item.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                className="rounded-sm font-mono text-xs tracking-wider text-muted-foreground uppercase hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
