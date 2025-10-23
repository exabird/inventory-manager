// Configuration Next.js pour logger les erreurs
const nextConfig = {
  // ... autres configurations
  
  // Logger les erreurs dans un fichier
  onDemandEntries: {
    // Période d'inactivité avant fermeture des pages
    maxInactiveAge: 25 * 1000,
    // Nombre de pages à garder simultanément
    pagesBufferLength: 2,
  },
  
  // Rediriger les erreurs vers un fichier
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = 'source-map';
    }
    return config;
  },
};

module.exports = nextConfig;
