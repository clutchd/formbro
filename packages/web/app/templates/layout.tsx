import type { PropsWithChildren } from "react";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export default function TemplatesLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
