/**
 * MONITOR EN TEMPS RÉEL - INVENTORY MANAGER
 * 
 * Ce script utilise Puppeteer pour capturer tous les logs console
 * en temps réel pendant le développement.
 * 
 * Usage:
 *   node monitor-realtime-console.js
 * 
 * Fonctionnalités:
 * - Capture tous les logs console (log, warn, error)
 * - Capture les erreurs de page (JavaScript errors)
 * - Capture les erreurs réseau (failed requests)
 * - Affichage en temps réel avec codes couleur
 * - Enregistrement dans des fichiers de log
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  url: process.env.APP_URL || 'http://localhost:3000',
  logDir: './logs',
  headless: false, // Mettre à true pour exécution en arrière-plan
  devtools: true,  // Ouvrir DevTools automatiquement
};

// Fichiers de log
const LOG_FILES = {
  all: path.join(CONFIG.logDir, 'console-all.log'),
  errors: path.join(CONFIG.logDir, 'console-errors.log'),
  network: path.join(CONFIG.logDir, 'network.log'),
  performance: path.join(CONFIG.logDir, 'performance.log'),
};

// Codes couleur pour la console
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Compteurs de statistiques
const stats = {
  logs: 0,
  warnings: 0,
  errors: 0,
  networkRequests: 0,
  networkErrors: 0,
  startTime: Date.now(),
};

/**
 * Créer le dossier de logs s'il n'existe pas
 */
function ensureLogDir() {
  if (!fs.existsSync(CONFIG.logDir)) {
    fs.mkdirSync(CONFIG.logDir, { recursive: true });
    console.log(`📁 Dossier de logs créé: ${CONFIG.logDir}`);
  }
}

/**
 * Initialiser les fichiers de log
 */
function initLogFiles() {
  const timestamp = new Date().toISOString();
  const header = `=== Session démarrée: ${timestamp} ===\n`;
  
  Object.values(LOG_FILES).forEach(file => {
    fs.writeFileSync(file, header);
  });
}

/**
 * Écrire dans un fichier de log
 */
function writeToLog(file, content) {
  try {
    fs.appendFileSync(file, content + '\n');
  } catch (error) {
    console.error(`❌ Erreur d'écriture dans ${file}:`, error.message);
  }
}

/**
 * Formatter un timestamp
 */
function formatTimestamp() {
  const now = new Date();
  return now.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
}

/**
 * Formatter une durée en ms
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}min`;
}

/**
 * Afficher les statistiques
 */
function displayStats() {
  const duration = Date.now() - stats.startTime;
  const avgLogsPerSec = (stats.logs / (duration / 1000)).toFixed(2);
  
  console.log('\n' + COLORS.bright + '═'.repeat(60) + COLORS.reset);
  console.log(COLORS.bright + '📊 STATISTIQUES' + COLORS.reset);
  console.log('─'.repeat(60));
  console.log(`⏱️  Durée de session: ${formatDuration(duration)}`);
  console.log(`📝 Logs: ${COLORS.cyan}${stats.logs}${COLORS.reset} (${avgLogsPerSec}/s)`);
  console.log(`⚠️  Warnings: ${COLORS.yellow}${stats.warnings}${COLORS.reset}`);
  console.log(`❌ Erreurs: ${COLORS.red}${stats.errors}${COLORS.reset}`);
  console.log(`🌐 Requêtes réseau: ${COLORS.blue}${stats.networkRequests}${COLORS.reset}`);
  console.log(`🚫 Erreurs réseau: ${COLORS.red}${stats.networkErrors}${COLORS.reset}`);
  console.log(COLORS.bright + '═'.repeat(60) + COLORS.reset + '\n');
}

/**
 * Handler pour les logs console
 */
function handleConsoleMessage(msg) {
  const type = msg.type();
  const text = msg.text();
  const timestamp = formatTimestamp();
  
  // Filtrer les logs inutiles
  if (text.includes('DevTools') || text.includes('[HMR]')) {
    return;
  }
  
  // Choisir la couleur selon le type
  let color = COLORS.white;
  let icon = '📝';
  
  switch (type) {
    case 'log':
      color = COLORS.white;
      icon = '📝';
      stats.logs++;
      break;
    case 'info':
      color = COLORS.cyan;
      icon = 'ℹ️';
      stats.logs++;
      break;
    case 'warn':
    case 'warning':
      color = COLORS.yellow;
      icon = '⚠️';
      stats.warnings++;
      break;
    case 'error':
      color = COLORS.red;
      icon = '❌';
      stats.errors++;
      break;
    case 'debug':
      color = COLORS.magenta;
      icon = '🔍';
      stats.logs++;
      break;
    default:
      stats.logs++;
  }
  
  // Afficher dans la console avec couleur
  const output = `${COLORS.dim}[${timestamp}]${COLORS.reset} ${color}${icon} [${type.toUpperCase()}]${COLORS.reset} ${text}`;
  console.log(output);
  
  // Écrire dans les fichiers de log
  const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${text}`;
  writeToLog(LOG_FILES.all, logEntry);
  
  if (type === 'error' || type === 'warn' || type === 'warning') {
    writeToLog(LOG_FILES.errors, logEntry);
  }
}

/**
 * Handler pour les erreurs de page
 */
function handlePageError(error) {
  const timestamp = formatTimestamp();
  stats.errors++;
  
  const output = `${COLORS.dim}[${timestamp}]${COLORS.reset} ${COLORS.red}💥 [PAGE ERROR]${COLORS.reset} ${error.message}`;
  console.error(output);
  
  if (error.stack) {
    console.error(COLORS.dim + error.stack + COLORS.reset);
  }
  
  const logEntry = `[${timestamp}] [PAGE ERROR] ${error.message}\n${error.stack || ''}`;
  writeToLog(LOG_FILES.all, logEntry);
  writeToLog(LOG_FILES.errors, logEntry);
}

/**
 * Handler pour les requêtes réseau
 */
async function handleNetworkRequest(request) {
  const url = request.url();
  const method = request.method();
  
  // Filtrer les requêtes inutiles
  if (url.includes('/_next/') || url.includes('/webpack') || url.includes('.hot-update.')) {
    return;
  }
  
  stats.networkRequests++;
}

/**
 * Handler pour les réponses réseau
 */
async function handleNetworkResponse(response) {
  const url = response.url();
  const status = response.status();
  const method = response.request().method();
  const timestamp = formatTimestamp();
  
  // Filtrer les requêtes inutiles
  if (url.includes('/_next/') || url.includes('/webpack') || url.includes('.hot-update.')) {
    return;
  }
  
  // Déterminer si c'est une requête Supabase
  const isSupabase = url.includes('supabase.co');
  
  // Couleur selon le status
  let statusColor = COLORS.green;
  if (status >= 400 && status < 500) {
    statusColor = COLORS.yellow;
  } else if (status >= 500) {
    statusColor = COLORS.red;
    stats.networkErrors++;
  }
  
  // Afficher seulement les requêtes importantes (API, Supabase)
  if (isSupabase || url.includes('/api/')) {
    const icon = isSupabase ? '🗄️' : '🌐';
    const output = `${COLORS.dim}[${timestamp}]${COLORS.reset} ${icon} ${statusColor}${status}${COLORS.reset} ${COLORS.cyan}${method}${COLORS.reset} ${url.substring(0, 80)}`;
    console.log(output);
    
    const logEntry = `[${timestamp}] [${status}] ${method} ${url}`;
    writeToLog(LOG_FILES.network, logEntry);
    
    // Si erreur, log dans le fichier d'erreurs
    if (status >= 400) {
      writeToLog(LOG_FILES.errors, logEntry);
      
      // Essayer de lire le corps de la réponse pour les erreurs
      try {
        const body = await response.text();
        if (body && body.length < 1000) {
          const errorBody = `    Body: ${body}`;
          console.error(COLORS.dim + errorBody + COLORS.reset);
          writeToLog(LOG_FILES.errors, errorBody);
        }
      } catch (e) {
        // Ignorer si le corps ne peut pas être lu
      }
    }
  }
}

/**
 * Handler pour les requêtes échouées
 */
function handleRequestFailed(request) {
  const timestamp = formatTimestamp();
  const url = request.url();
  const failure = request.failure();
  
  stats.networkErrors++;
  
  const output = `${COLORS.dim}[${timestamp}]${COLORS.reset} ${COLORS.red}🚫 [NETWORK FAILED]${COLORS.reset} ${url}`;
  console.error(output);
  console.error(COLORS.dim + `    Raison: ${failure.errorText}` + COLORS.reset);
  
  const logEntry = `[${timestamp}] [NETWORK FAILED] ${url}\n    Raison: ${failure.errorText}`;
  writeToLog(LOG_FILES.network, logEntry);
  writeToLog(LOG_FILES.errors, logEntry);
}

/**
 * Capturer les métriques de performance
 */
async function capturePerformanceMetrics(page) {
  try {
    const metrics = await page.metrics();
    const timestamp = formatTimestamp();
    
    const logEntry = `[${timestamp}] Performance Metrics:\n` +
      `  - JSHeapUsedSize: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB\n` +
      `  - JSHeapTotalSize: ${(metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2)} MB\n` +
      `  - Documents: ${metrics.Documents}\n` +
      `  - Frames: ${metrics.Frames}\n` +
      `  - JSEventListeners: ${metrics.JSEventListeners}\n` +
      `  - Nodes: ${metrics.Nodes}`;
    
    writeToLog(LOG_FILES.performance, logEntry);
  } catch (error) {
    // Ignorer les erreurs de métrique
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log(COLORS.bright + '🚀 MONITORING EN TEMPS RÉEL - INVENTORY MANAGER' + COLORS.reset);
  console.log(COLORS.dim + '─'.repeat(60) + COLORS.reset);
  console.log(`📍 URL: ${COLORS.cyan}${CONFIG.url}${COLORS.reset}`);
  console.log(`📁 Logs: ${COLORS.cyan}${CONFIG.logDir}${COLORS.reset}`);
  console.log(COLORS.dim + '─'.repeat(60) + COLORS.reset + '\n');
  
  // Préparer les dossiers et fichiers
  ensureLogDir();
  initLogFiles();
  
  // Lancer le navigateur
  console.log('🌐 Lancement du navigateur...\n');
  
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    devtools: CONFIG.devtools,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  
  // Configurer la taille de la fenêtre
  await page.setViewport({ width: 1280, height: 800 });
  
  // Attacher les handlers
  page.on('console', handleConsoleMessage);
  page.on('pageerror', handlePageError);
  page.on('request', handleNetworkRequest);
  page.on('response', handleNetworkResponse);
  page.on('requestfailed', handleRequestFailed);
  
  // Capturer les métriques de performance toutes les 30 secondes
  const metricsInterval = setInterval(() => {
    capturePerformanceMetrics(page);
  }, 30000);
  
  // Afficher les statistiques toutes les 60 secondes
  const statsInterval = setInterval(() => {
    displayStats();
  }, 60000);
  
  // Naviguer vers l'application
  console.log(`🔍 Chargement de ${CONFIG.url}...\n`);
  
  try {
    await page.goto(CONFIG.url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log(COLORS.green + '✅ Page chargée avec succès!' + COLORS.reset + '\n');
    console.log(COLORS.bright + '📡 Monitoring en cours... (Ctrl+C pour arrêter)' + COLORS.reset);
    console.log(COLORS.dim + '─'.repeat(60) + COLORS.reset + '\n');
    
  } catch (error) {
    console.error(COLORS.red + `❌ Erreur de chargement: ${error.message}` + COLORS.reset);
    console.error(COLORS.dim + 'Assurez-vous que l\'application est en cours d\'exécution (npm run dev)' + COLORS.reset);
    process.exit(1);
  }
  
  // Gérer l'arrêt propre
  process.on('SIGINT', async () => {
    console.log('\n\n' + COLORS.yellow + '⏹️  Arrêt du monitoring...' + COLORS.reset + '\n');
    
    // Afficher les statistiques finales
    displayStats();
    
    // Nettoyer
    clearInterval(metricsInterval);
    clearInterval(statsInterval);
    
    // Fermer le navigateur
    await browser.close();
    
    console.log(COLORS.green + '✅ Monitoring terminé.' + COLORS.reset);
    console.log(COLORS.dim + `📁 Logs sauvegardés dans: ${CONFIG.logDir}` + COLORS.reset + '\n');
    
    process.exit(0);
  });
}

// Exécuter
main().catch(error => {
  console.error(COLORS.red + `❌ Erreur fatale: ${error.message}` + COLORS.reset);
  console.error(error.stack);
  process.exit(1);
});

