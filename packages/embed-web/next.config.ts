import type { NextConfig } from "next";

function apiOrigin() {
  try {
    return new URL(process.env.FORMBRO_API_URL ?? "http://localhost:3000").origin;
  } catch {
    return "http://localhost:3000";
  }
}

const contentSecurityPolicy = [
  "default-src 'self'",
  `connect-src 'self' ${apiOrigin()}`,
  "font-src 'self' data:",
  "frame-ancestors *",
  "img-src 'self' data: blob:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  headers: async () => [
    {
      source: "/embed.js",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
        },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
    {
      source: "/e/:path*",
      headers: [
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
    {
      source: "/i/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          value: contentSecurityPolicy.replace("frame-ancestors *", "frame-ancestors 'self'"),
        },
        { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
  ],
};

export default nextConfig;
