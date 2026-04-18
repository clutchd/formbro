import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(
  {
    allowedDevOrigins: ["localhost"],
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "*.googleusercontent.com",
          port: "",
          pathname: "**",
        },
      ],
    },
    rewrites: async () => ({
      beforeFiles: [
        {
          source: "/ingest/static/:path*",
          destination: "https://us-assets.i.posthog.com/static/:path*",
        },
        {
          source: "/ingest/:path*",
          destination: "https://us.i.posthog.com/:path*",
        },
      ],
    }),
  },
  {
    org: "clutchd-llc",
    project: "formbro",
    silent: !process.env.CI,
    tunnelRoute: "/monitoring",
  },
);
