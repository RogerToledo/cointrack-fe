import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@cointrack/services",
    "@cointrack/types",
    "@cointrack/utils",
  ],
};

export default nextConfig;
