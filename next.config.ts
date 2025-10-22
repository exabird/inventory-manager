import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permettre l'accès depuis le réseau local (smartphone)
  allowedDevOrigins: ['192.168.1.154'],
  
  // Configuration pour la caméra et le scanner
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
