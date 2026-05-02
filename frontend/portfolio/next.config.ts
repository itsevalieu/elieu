import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@evalieu/design-system"],
  images: {
    domains: [],
  },
};

export default nextConfig;
