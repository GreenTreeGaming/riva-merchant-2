import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ This is where it belongs
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
