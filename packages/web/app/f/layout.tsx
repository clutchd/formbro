import type { PropsWithChildren } from "react";
import { ConvexProvider } from "@/lib/convex/client";

export default function PublicFormLayout({ children }: PropsWithChildren) {
  return <ConvexProvider>{children}</ConvexProvider>;
}
