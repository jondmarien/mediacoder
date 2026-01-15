import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb", // Allow larger uploads for media
    },
  },
};

export default nextConfig;
