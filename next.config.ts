import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permettre l'accès depuis le réseau local (smartphone)
  allowedDevOrigins: ['192.168.1.154'],
  
  // Configuration pour la caméra et le scanner
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Améliorer la gestion de l'hydratation
    optimizePackageImports: ['lucide-react'],
  },
  // Désactiver les warnings d'hydratation en développement pour les extensions de navigateur
  onDemandEntries: {
    // période pendant laquelle une page sera gardée en mémoire
    maxInactiveAge: 25 * 1000,
    // nombre de pages qui doivent être gardées simultanément
    pagesBufferLength: 2,
  },
};

export default nextConfig;
