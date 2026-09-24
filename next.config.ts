import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep TypeScript validation enabled for production builds.
  async redirects() {
    return [
      "last-name-generator", "lorem-ipsum-generator", "qr-code-generator",
      "random-choice-picker", "random-name-generator", "random-number-generator",
      "random-password-generator", "random-username-generator",
    ].map(slug => ({
      source: `/tools/${slug}`,
      destination: `/trending-tools/${slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
