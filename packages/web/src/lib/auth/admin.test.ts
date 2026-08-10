import { describe, expect, mock, test } from "bun:test";

let adminResult:
  | {
      ok: true;
      data: { name: string; email: string; image: string | undefined };
    }
  | {
      ok: false;
      data: null;
      error: {
        code: "NOT_AUTHENTICATED" | "ADMIN_REQUIRED";
        message: string;
        status: "UNAUTHORIZED" | "FORBIDDEN";
      };
    };

mock.module("./server", () => ({
  fetchAuthQuery: async () => adminResult,
}));

const { requireAdminPage } = await import("./admin");

describe("requireAdminPage", () => {
  test("returns the signed-in admin", async () => {
    adminResult = {
      ok: true,
      data: { name: "Admin", email: "admin@example.com", image: undefined },
    };

    await expect(requireAdminPage()).resolves.toEqual(adminResult.data);
  });

  test("sends signed-out users through the standard sign-in flow", async () => {
    adminResult = {
      ok: false,
      data: null,
      error: {
        code: "NOT_AUTHENTICATED",
        message: "Not authenticated.",
        status: "UNAUTHORIZED",
      },
    };

    await expect(requireAdminPage()).rejects.toMatchObject({
      digest: "NEXT_REDIRECT;replace;/sign-in?callbackURL=%2Fadmin;307;",
    });
  });

  test("hides the portal from signed-in non-admins", async () => {
    adminResult = {
      ok: false,
      data: null,
      error: {
        code: "ADMIN_REQUIRED",
        message: "Admin access required.",
        status: "FORBIDDEN",
      },
    };

    await expect(requireAdminPage()).rejects.toMatchObject({
      digest: "NEXT_HTTP_ERROR_FALLBACK;404",
    });
  });
});
