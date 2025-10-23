const puppeteer = require('puppeteer');

async function captureErrors() {
  console.log('🔍 Capturing JavaScript errors...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  const errors = [];
  
  // Capturer les erreurs de console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });
  
  // Capturer les erreurs JavaScript non gérées
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });
  
  // Capturer les erreurs de requête
  page.on('requestfailed', request => {
    errors.push(`Request Failed: ${request.url()} - ${request.failure().errorText}`);
  });
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('✅ Page loaded successfully');
    
    // Attendre un peu pour capturer les erreurs
    await page.waitForTimeout(3000);
    
    if (errors.length > 0) {
      console.log(`❌ ${errors.length} erreur(s) détectée(s):`);
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ Aucune erreur JavaScript détectée');
    }
    
  } catch (error) {
    console.log(`❌ Navigation Error: ${error.message}`);
  }
  
  await browser.close();
}

captureErrors().catch(console.error);
