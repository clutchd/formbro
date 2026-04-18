import { api } from "@formbro/convex/_generated/api";
import { redirect } from "next/navigation";
import { isAuthenticated, preloadAuthQuery } from "@/lib/auth/server";
import { AppDataProvider } from "./data-provider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/sign-in");
  }

  const [preloadedAuthUser] = await Promise.all([preloadAuthQuery(api.auth.get)]);

  return <AppDataProvider preloadedAuthUser={preloadedAuthUser}>{children}</AppDataProvider>;
}
