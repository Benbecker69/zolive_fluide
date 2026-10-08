import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not advertise the framework in response headers.
  poweredByHeader: false,
  reactStrictMode: true,
  // Self-contained server for the Docker image (see Dockerfile).
  output: "standalone",
};

export default nextConfig;
