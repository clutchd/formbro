export const APP_NAME = "FormBro";

const envUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL;

if (!envUrl) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_URL is not set. Set NEXT_PUBLIC_APP_URL or BETTER_AUTH_URL for production builds.");
  }
  console.warn("[FormBro] NEXT_PUBLIC_APP_URL is not set, using http://localhost:3000 for local development.");
}

export const APP_URL: string = envUrl ?? "http://localhost:3000";
export const APP_DESCRIPTION =
  "Create, publish, and automate your forms. FormBro is the open-source form platform built for humans, teams, and agents.";
export const TAGLINE = "Keep your forms simple, bro.";
