import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
