import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      STRIPE_SECRET_KEY: "sk_test_system_forms",
    },
    environment: "edge-runtime",
  },
});
