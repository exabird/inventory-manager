const puppeteer = require('puppeteer');

async function monitorErrors() {
  console.log('🔍 Monitoring JavaScript errors...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capturer les erreurs de la console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });
  
  // Capturer les erreurs JavaScript non gérées
  page.on('pageerror', error => {
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  // Capturer les erreurs de requête
  page.on('requestfailed', request => {
    console.log(`❌ Request Failed: ${request.url()} - ${request.failure().errorText}`);
  });
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('✅ Page loaded successfully');
    
    // Attendre un peu pour capturer les erreurs
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.log(`❌ Navigation Error: ${error.message}`);
  }
  
  await browser.close();
}

monitorErrors().catch(console.error);
