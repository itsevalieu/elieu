import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@evalieu/design-system"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "cdn.evalieu.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  sassOptions: {},
};

export default nextConfig;
