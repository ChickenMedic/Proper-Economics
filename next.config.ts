import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    // Static export has no image optimization server; portraits are
    // pre-sized locally and served as-is.
    unoptimized: true,
  },
};

export default nextConfig;
