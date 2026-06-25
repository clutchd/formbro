import { describe, expect, test } from "bun:test";
import { authCallbackURL, authHref, inviteCallbackURL, inviteSignInHref } from "./callback-url";

describe("auth callback URLs", () => {
  test("allows app-relative callback URLs", () => {
    expect(authCallbackURL("/invite/token")).toBe("/invite/token");
    expect(authCallbackURL(["/dashboard/workspace", "/ignored"])).toBe("/dashboard/workspace");
  });

  test("rejects absolute and protocol-relative callback URLs", () => {
    expect(authCallbackURL("https://example.com/invite/token")).toBe("/dashboard");
    expect(authCallbackURL("//example.com/invite/token")).toBe("/dashboard");
    expect(authCallbackURL(undefined)).toBe("/dashboard");
  });

  test("builds invite auth URLs that return to the invite", () => {
    expect(inviteCallbackURL("tok/en")).toBe("/invite/tok%2Fen");
    expect(inviteSignInHref("tok/en")).toBe("/sign-in?callbackURL=%2Finvite%2Ftok%252Fen");
    expect(authHref("/sign-up", "/invite/token")).toBe("/sign-up?callbackURL=%2Finvite%2Ftoken");
  });
});
