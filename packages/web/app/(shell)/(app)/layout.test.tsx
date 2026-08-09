import { describe, expect, mock, test } from "bun:test";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const pathname =
  "/dashboard/city-mechanical-inc-1/riuamx6gue/submissions/kn71ct5aemgwgmv6wdyrmm46ys899h32";

mock.module("app/_data-provider", () => ({
  useAppData: () => ({ authUser: { ok: false } }),
}));

const { default: AppLayout } = await import("./layout");

describe("AppLayout", () => {
  test("preserves the requested page when redirecting an unauthenticated user", () => {
    let redirectError: unknown;

    try {
      renderToStaticMarkup(
        createElement(
          PathnameContext.Provider,
          { value: pathname },
          createElement(AppLayout, { children: "Dashboard" }),
        ),
      );
    } catch (error) {
      redirectError = error;
    }

    expect((redirectError as { digest?: string }).digest).toBe(
      `NEXT_REDIRECT;replace;/sign-in?callbackURL=${encodeURIComponent(pathname)};307;`,
    );
  });
});
