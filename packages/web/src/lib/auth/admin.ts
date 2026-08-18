import { api } from "@formbro/convex/_generated/api";
import { notFound, redirect } from "next/navigation";
import { authHref } from "./callback-url";
import { fetchAuthQuery } from "./server";

const ADMIN_PATH = "/admin";

export async function requireAdminPage() {
  const admin = await fetchAuthQuery(api.auth.getAdmin);

  if (admin.ok) {
    return admin.data;
  }

  if (admin.error.code === "NOT_AUTHENTICATED") {
    redirect(authHref("/sign-in", ADMIN_PATH));
  }

  notFound();
}
