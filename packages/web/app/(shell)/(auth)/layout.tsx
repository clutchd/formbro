import type { Metadata } from "next";
import { Card } from "@formbro/ui/card";
import { Logo } from "@formbro/ui/logo";
import Link from "next/link";
import { type PropsWithChildren, Suspense } from "react";
import { AuthError } from "./auth-error";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-muted">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)] bg-size-[3rem_3rem] opacity-40" />
      <div className="absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full bg-linear-to-bl from-brand-400/10 to-brand-200/5 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-[500px] w-[500px] rounded-full bg-linear-to-tr from-brand-300/10 to-brand-100/5 blur-3xl" />

      <div className="relative w-full max-w-[500px] px-4">
        <div className="mb-10 flex justify-center">
          <Link href="/">
            <Logo className="text-3xl" />
          </Link>
        </div>
        <div className="relative">
          <div className="absolute -inset-2 rounded-xl bg-linear-to-r from-brand-400 to-brand-300 opacity-30 blur-2xl" />
          <Card className="relative items-center gap-10 py-8">{children}</Card>
        </div>
        <Suspense fallback={null}>
          <AuthError />
        </Suspense>
      </div>
    </div>
  );
}
