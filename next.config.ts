import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // localhost vs 127.0.0.1 must both serve turbopack assets in dev
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.socratink.ai" }],
        destination: "https://socratink.ai/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
