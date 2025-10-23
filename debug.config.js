/**
 * CONFIGURATION CENTRALISÉE DE DEBUGGING - INVENTORY MANAGER
 * 
 * Ce fichier centralise toutes les configurations de debugging et monitoring
 * pour faciliter le travail des agents et développeurs.
 * 
 * Usage:
 *   const debugConfig = require('./debug.config.js');
 *   console.log(debugConfig.logging.enabledModules);
 */

module.exports = {
  /**
   * Configuration des logs
   */
  logging: {
    // Niveau de log global (debug, info, warn, error)
    level: process.env.LOG_LEVEL || 'debug',
    
    // Activer les logs dans la console
    enableConsole: true,
    
    // Activer les logs dans les fichiers
    enableFiles: true,
    
    // Modules pour lesquels activer les logs détaillés
    enabledModules: [
      'ProductService',
      'CategoryService',
      'StockService',
      'Supabase',
      'ImageService',
      'ProductDetection',
      'ScrapingService'
    ],
    
    // Prefixes des logs avec emojis
    prefixes: {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      debug: '🔍',
      loading: '📦',
      process: '🔄',
      data: '📊',
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      network: '🌐',
      database: '🗄️',
      ai: '🤖'
    }
  },

  /**
   * Configuration du monitoring en temps réel
   */
  monitoring: {
    // Activer le monitoring Puppeteer
    enablePuppeteer: true,
    
    // URL de l'application à monitorer
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    
    // Port du serveur de développement
    devPort: 3000,
    
    // Activer le mode headless pour Puppeteer
    headless: false,
    
    // Ouvrir DevTools automatiquement
    devtools: true,
    
    // Capturer les screenshots en cas d'erreur
    captureScreenshots: true,
    
    // Dossier pour les screenshots
    screenshotDir: './logs/screenshots',
    
    // Capturer les métriques de performance
    captureMetrics: true,
    
    // Intervalle de capture des métriques (ms)
    metricsInterval: 30000,
    
    // Afficher les statistiques
    showStats: true,
    
    // Intervalle d'affichage des stats (ms)
    statsInterval: 60000
  },

  /**
   * Configuration des fichiers de log
   */
  files: {
    // Dossier racine pour les logs
    logDir: './logs',
    
    // Fichiers de log
    all: './logs/console-all.log',
    errors: './logs/console-errors.log',
    network: './logs/network.log',
    performance: './logs/performance.log',
    supabase: './logs/supabase.log',
    
    // Rotation des logs
    maxSize: '10m',      // Taille max d'un fichier de log
    maxFiles: '7d',       // Garder les logs pendant 7 jours
  },

  /**
   * Configuration des filtres de logs
   */
  filters: {
    // Types de logs à inclure
    includeTypes: ['log', 'info', 'warn', 'error', 'debug'],
    
    // Mots-clés à surveiller (vide = tous)
    keywords: [],
    
    // Mots-clés à exclure
    excludeKeywords: [
      'DevTools',
      '[HMR]',
      'webpack',
      '.hot-update.'
    ],
    
    // URLs à monitorer (vide = toutes)
    monitorUrls: [
      'supabase.co',
      '/api/'
    ],
    
    // URLs à ignorer
    ignoreUrls: [
      '/_next/',
      '/webpack',
      '.hot-update.',
      'chrome-extension://'
    ]
  },

  /**
   * Configuration du debugging React
   */
  react: {
    // Activer les logs de rendu des composants
    logRenders: false,
    
    // Activer les logs d'état
    logState: true,
    
    // Activer les logs d'effets
    logEffects: true,
    
    // Activer les logs de contexte
    logContext: false,
    
    // Composants à surveiller spécifiquement
    watchedComponents: [
      'Home',
      'ProductInspector',
      'CompactProductList',
      'ProductForm',
      'BarcodeScanner'
    ]
  },

  /**
   * Configuration du debugging Supabase
   */
  supabase: {
    // Activer les logs de requêtes
    logQueries: true,
    
    // Activer les logs d'erreurs
    logErrors: true,
    
    // Activer les logs de performance
    logPerformance: true,
    
    // Seuil de temps pour les requêtes lentes (ms)
    slowQueryThreshold: 1000,
    
    // Tables à surveiller spécifiquement
    watchedTables: [
      'products',
      'categories',
      'stock_operations',
      'product_history',
      'pieces'
    ]
  },

  /**
   * Configuration des breakpoints de debugging
   */
  breakpoints: {
    // Activer les breakpoints conditionnels
    enabled: false,
    
    // Conditions de breakpoint
    conditions: {
      // Breakpoint quand une erreur Supabase se produit
      onSupabaseError: false,
      
      // Breakpoint quand un produit est créé
      onProductCreate: false,
      
      // Breakpoint quand le stock change
      onStockChange: false,
      
      // Breakpoint sur des valeurs spécifiques
      onSpecificValues: {
        enabled: false,
        // Exemple: s'arrêter quand product.quantity === 0
        checks: []
      }
    }
  },

  /**
   * Configuration de l'analyse de performance
   */
  performance: {
    // Activer l'analyse de performance
    enabled: true,
    
    // Activer le profiling React
    reactProfiling: false,
    
    // Activer le suivi des re-renders
    trackReRenders: true,
    
    // Activer le suivi de la mémoire
    trackMemory: true,
    
    // Intervalle de capture mémoire (ms)
    memoryInterval: 60000,
    
    // Seuils d'alerte
    thresholds: {
      // Alerte si le heap JS dépasse X MB
      jsHeapSize: 100,
      
      // Alerte si le temps de rendu dépasse X ms
      renderTime: 100,
      
      // Alerte si le temps de réponse API dépasse X ms
      apiResponseTime: 2000
    }
  },

  /**
   * Configuration des tests automatisés
   */
  testing: {
    // Activer les tests E2E automatiques
    enabled: false,
    
    // Scénarios de test
    scenarios: [
      {
        name: 'Charger la liste des produits',
        steps: [
          { action: 'goto', url: '/' },
          { action: 'waitForSelector', selector: '.product-list-item' },
          { action: 'count', selector: '.product-list-item', expect: 'greaterThan', value: 0 }
        ]
      },
      {
        name: 'Rechercher un produit',
        steps: [
          { action: 'goto', url: '/' },
          { action: 'type', selector: 'input[placeholder="Chercher..."]', value: 'test' },
          { action: 'waitForTimeout', timeout: 1000 },
          { action: 'assertVisible', selector: '.product-list-item' }
        ]
      }
    ],
    
    // Exécuter les tests automatiquement au démarrage
    autoRun: false,
    
    // Intervalle d'exécution des tests (ms)
    runInterval: 300000, // 5 minutes
  },

  /**
   * Configuration des notifications
   */
  notifications: {
    // Activer les notifications desktop
    enableDesktop: false,
    
    // Notifier en cas d'erreur critique
    onCriticalError: true,
    
    // Notifier en cas de build échoué
    onBuildFailure: true,
    
    // Notifier en cas de test échoué
    onTestFailure: false,
    
    // Son de notification
    sound: true
  },

  /**
   * Configuration de l'export des logs
   */
  export: {
    // Format d'export (json, csv, text)
    format: 'json',
    
    // Inclure les timestamps
    includeTimestamps: true,
    
    // Inclure les stack traces
    includeStackTraces: true,
    
    // Dossier d'export
    exportDir: './logs/exports',
    
    // Nom du fichier d'export
    filename: 'debug-export-{timestamp}.json'
  },

  /**
   * Configuration des outils de debugging
   */
  tools: {
    // Activer React DevTools
    reactDevTools: true,
    
    // Activer Redux DevTools
    reduxDevTools: false,
    
    // Activer le Supabase Dashboard
    supabaseDashboard: true,
    
    // Activer le Network Inspector
    networkInspector: true,
    
    // Activer le Performance Monitor
    performanceMonitor: true
  },

  /**
   * Variables d'environnement pour le debugging
   */
  env: {
    // Mode de développement
    isDevelopment: process.env.NODE_ENV !== 'production',
    
    // Mode de production
    isProduction: process.env.NODE_ENV === 'production',
    
    // Mode de test
    isTest: process.env.NODE_ENV === 'test',
    
    // Activer le debug
    DEBUG: process.env.DEBUG || false,
    
    // Niveau de log
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
    
    // Port du serveur
    PORT: process.env.PORT || 3000
  },

  /**
   * Helpers pour le debugging
   */
  helpers: {
    /**
     * Formater un timestamp
     */
    formatTimestamp: () => {
      const now = new Date();
      return now.toISOString().split('T')[1].split('.')[0];
    },

    /**
     * Formater une durée en ms
     */
    formatDuration: (ms) => {
      if (ms < 1000) return `${ms}ms`;
      if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
      return `${(ms / 60000).toFixed(2)}min`;
    },

    /**
     * Créer un log formaté
     */
    createLog: (type, module, message, data = null) => {
      const timestamp = module.exports.helpers.formatTimestamp();
      const prefix = module.exports.logging.prefixes[type] || '';
      
      let log = `[${timestamp}] ${prefix} [${module}] ${message}`;
      
      if (data) {
        log += `\n    Data: ${JSON.stringify(data, null, 2)}`;
      }
      
      return log;
    }
  }
};

/**
 * Export des fonctions utilitaires
 */
module.exports.log = function(type, module, message, data) {
  if (!module.exports.logging.enableConsole) return;
  
  const enabledModules = module.exports.logging.enabledModules;
  if (enabledModules.length > 0 && !enabledModules.includes(module)) return;
  
  const log = module.exports.helpers.createLog(type, module, message, data);
  
  switch (type) {
    case 'error':
      console.error(log);
      break;
    case 'warning':
      console.warn(log);
      break;
    case 'info':
      console.info(log);
      break;
    default:
      console.log(log);
  }
};

// Exemple d'utilisation :
// const debug = require('./debug.config.js');
// debug.log('success', 'ProductService', 'Produit créé avec succès', { id: '123', name: 'iPhone' });

