export const APP_NAME = "FormBro";
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.BETTER_AUTH_URL ??
  (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000");

if (!appUrl) {
  throw new Error("APP_URL is not set");
}

export const APP_URL: string = appUrl;
export const APP_DESCRIPTION =
  "Create, publish, and automate your forms. FormBro is the open-source form platform built for humans, teams, and agents.";
export const TAGLINE = "Keep your forms simple, bro.";
