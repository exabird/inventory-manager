const puppeteer = require('puppeteer');

class NextJSErrorMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.errors = [];
  }

  async init() {
    console.log('🔍 Initialisation du monitoring Next.js...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Capturer les erreurs de console
    this.page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warn') {
        const error = {
          type: msg.type(),
          text: msg.text(),
          timestamp: new Date().toISOString()
        };
        this.errors.push(error);
        console.log(`❌ ${error.type.toUpperCase()}: ${error.text}`);
      }
    });
    
    // Capturer les erreurs de page
    this.page.on('pageerror', error => {
      const pageError = {
        type: 'pageerror',
        text: error.message,
        timestamp: new Date().toISOString()
      };
      this.errors.push(pageError);
      console.log(`❌ PAGE ERROR: ${error.message}`);
    });
    
    // Capturer les erreurs de requête
    this.page.on('requestfailed', request => {
      const requestError = {
        type: 'requestfailed',
        text: `${request.url()} - ${request.failure().errorText}`,
        timestamp: new Date().toISOString()
      };
      this.errors.push(requestError);
      console.log(`❌ REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
    });
  }

  async monitor() {
    console.log('🚀 Démarrage du monitoring en temps réel...');
    
    await this.page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    console.log('✅ Page chargée, monitoring actif');
    
    // Surveiller les changements de page
    setInterval(async () => {
      try {
        await this.page.reload({ waitUntil: 'networkidle0' });
      } catch (error) {
        console.log('⚠️ Erreur lors du rechargement:', error.message);
      }
    }, 30000); // Recharger toutes les 30 secondes
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Démarrer le monitoring
const monitor = new NextJSErrorMonitor();

monitor.init().then(() => {
  monitor.monitor();
}).catch(error => {
  console.error('❌ Erreur lors de l\'initialisation:', error);
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du monitoring...');
  await monitor.close();
  process.exit(0);
});
