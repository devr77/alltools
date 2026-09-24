import type { NextConfig } from "next";

const TORRENT_SITE = "https://devr77.github.io/alltools/torrent/";

const nextConfig: NextConfig = {
  // Keep TypeScript validation enabled for production builds.
  async redirects() {
    return [
      ...[
        "last-name-generator", "lorem-ipsum-generator", "qr-code-generator",
        "random-choice-picker", "random-name-generator", "random-number-generator",
        "random-password-generator", "random-username-generator",
      ].map(slug => ({
        source: `/tools/${slug}`,
        destination: `/trending-tools/${slug}`,
        permanent: true,
      })),
      // Torrent tools moved to the standalone static site in torrent/ (GitHub Pages).
      // Temporary so the destination can change later (e.g. to a custom domain).
      { source: "/torrent", destination: TORRENT_SITE, permanent: false },
      { source: "/torrent/:tool", destination: `${TORRENT_SITE}:tool/`, permanent: false },
    ];
  },
};

export default nextConfig;
