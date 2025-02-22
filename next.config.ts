import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['lh3.googleusercontent.com', "s2.coinmarketcap.com"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
