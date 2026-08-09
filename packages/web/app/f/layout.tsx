import type { PropsWithChildren } from "react";
import { Toaster } from "@/components/sonner";
import { ConvexProvider } from "@/lib/convex/client";
import { PosthogProvider } from "@/lib/posthog";

export default function PublicFormLayout({ children }: PropsWithChildren) {
  return (
    <ConvexProvider>
      <PosthogProvider>
        {children}
        <Toaster />
      </PosthogProvider>
    </ConvexProvider>
  );
}
