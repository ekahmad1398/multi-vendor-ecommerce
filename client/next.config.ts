import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  // Browser requests stay on the storefront origin. This prevents a secure
  // httpOnly session cookie from being treated as a third-party Render cookie.
  async rewrites() {
    const configuredUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:30001/api";
    const apiUrl = configuredUrl.replace(/\/+$/, "").endsWith("/api")
      ? configuredUrl.replace(/\/+$/, "")
      : `${configuredUrl.replace(/\/+$/, "")}/api`;
    return [{ source: "/api/:path*", destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;
