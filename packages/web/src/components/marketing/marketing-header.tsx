import { Button } from "@formbro/ui/button";
import { Logo } from "@formbro/ui/logo";
import Link from "next/link";

const navigation = [
  { href: "/templates", label: "Templates" },
  { href: "/#builder", label: "Builder" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/#pricing", label: "Pricing" },
] as const;

export function MarketingHeader() {
  return (
    <header className="border-b bg-background/95">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          aria-label="FormBro home"
          className="rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Logo />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 font-mono text-xs tracking-wider text-muted-foreground uppercase md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/templates"
            className="rounded-sm font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:hidden"
          >
            Templates
          </Link>
          <Button asChild variant="link" className="hidden sm:inline-flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Start trial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
