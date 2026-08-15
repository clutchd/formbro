import { describe, expect, mock, test } from "bun:test";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { renderToStaticMarkup } from "react-dom/server";

const pathname = "/dashboard/formbro";

mock.module("app/_data-provider", () => ({
  useAppData: () => ({ authUser: { ok: false } }),
}));

const { default: AppLayout } = await import("./layout");

describe("AppLayout", () => {
  test("preserves the requested page when redirecting an unauthenticated user", () => {
    let redirectError: unknown;

    try {
      renderToStaticMarkup(
        <PathnameContext.Provider value={pathname}>
          <AppLayout>Dashboard</AppLayout>
        </PathnameContext.Provider>,
      );
    } catch (error) {
      redirectError = error;
    }

    expect((redirectError as { digest?: string }).digest).toBe(
      `NEXT_REDIRECT;replace;/sign-in?callbackURL=${encodeURIComponent(pathname)};307;`,
    );
  });
});
