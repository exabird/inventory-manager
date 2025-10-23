const http = require('http');

function checkErrors() {
  console.log(`${new Date().toLocaleTimeString()} - Vérification des erreurs...`);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      // Vérifier les erreurs dans le HTML
      const errors = data.match(/error|Error|ERROR|undefined|null/g);
      if (errors && errors.length > 0) {
        console.log(`❌ ${errors.length} erreur(s) détectée(s) dans le HTML`);
        console.log(`   Erreurs: ${errors.slice(0, 3).join(', ')}`);
      } else {
        console.log('✅ Aucune erreur détectée dans le HTML');
      }
      
      // Vérifier si Next.js est en cours d'exécution
      if (res.statusCode === 200) {
        console.log('✅ Application accessible');
      } else {
        console.log(`❌ Application retourne le code ${res.statusCode}`);
      }
      
      console.log('');
    });
  });
  
  req.on('error', (err) => {
    console.log(`❌ Erreur de connexion: ${err.message}`);
  });
  
  req.end();
}

// Vérifier toutes les 10 secondes
setInterval(checkErrors, 10000);

// Vérifier immédiatement
checkErrors();
