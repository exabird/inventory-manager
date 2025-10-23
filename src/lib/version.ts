// Configuration de version de l'application
export const APP_VERSION = '0.1.21';
export const APP_NAME = 'Inventory Manager';

// Informations de version
export const VERSION_INFO = {
  version: APP_VERSION,
  name: APP_NAME,
  buildDate: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
} as const;

// Fonction pour obtenir la version complète
export const getVersionInfo = () => {
  return {
    ...VERSION_INFO,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  };
};
