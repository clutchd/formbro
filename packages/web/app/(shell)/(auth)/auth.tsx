import Link from "next/link";
import { AuthLinks } from "./auth-links";

export function Auth({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
}: {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}) {
  return (
    <>
      <div className="space-y-1.5 text-center">
        <h1 className="font-display text-xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="w-full space-y-3">
        <AuthLinks />
      </div>

      <p className="text-sm text-muted-foreground">
        {footerText}{" "}
        <Link
          href={footerLinkHref}
          className="font-semibold text-foreground underline underline-offset-4 hover:text-foreground/80"
        >
          {footerLinkText}
        </Link>
      </p>
    </>
  );
}
