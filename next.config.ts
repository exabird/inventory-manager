import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour la caméra et le scanner
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
