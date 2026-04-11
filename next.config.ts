import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendBaseUrl = process.env.SERVER_API_BASE_URL;
    if (!backendBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
