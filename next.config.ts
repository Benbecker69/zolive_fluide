import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Do not advertise the framework in response headers.
  poweredByHeader: false,
  reactStrictMode: true,
  // Self-contained server for the Docker image (see Dockerfile).
  output: "standalone",
  // Native module: loaded by Node.js at run time instead of being bundled.
  serverExternalPackages: ["@node-rs/argon2"],
};

// Wires the request configuration of src/i18n/request.ts into the build.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
