#!/bin/bash

echo "🔍 Advanced Next.js Error Monitor"
echo "================================="
echo ""

# Fonction pour capturer les erreurs JavaScript via Puppeteer
capture_js_errors() {
  echo "$(date '+%H:%M:%S') - Capture des erreurs JavaScript..."
  
  # Utiliser Node.js pour capturer les erreurs de console
  node -e "
    const http = require('http');
    
    http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // Chercher les erreurs dans le HTML
        const errors = data.match(/console\.(error|warn)/g) || [];
        const undefineds = data.match(/undefined/g) || [];
        const nulls = data.match(/null/g) || [];
        
        if (errors.length > 0 || undefineds.length > 0 || nulls.length > 0) {
          console.log('❌ Erreurs détectées:');
          if (errors.length > 0) console.log('  - Console errors/warns:', errors.length);
          if (undefineds.length > 0) console.log('  - Undefined values:', undefineds.length);
          if (nulls.length > 0) console.log('  - Null values:', nulls.length);
        } else {
          console.log('✅ Aucune erreur détectée');
        }
      });
    }).on('error', (err) => {
      console.log('❌ Erreur de connexion:', err.message);
    });
  "
}

# Fonction pour surveiller les logs Next.js
monitor_nextjs_logs() {
  echo "$(date '+%H:%M:%S') - Surveillance des logs Next.js..."
  
  # Vérifier si le processus Next.js est en cours d'exécution
  if pgrep -f "next dev" > /dev/null; then
    echo "✅ Next.js en cours d'exécution"
  else
    echo "❌ Next.js arrêté"
  fi
  
  # Vérifier les erreurs dans les logs récents
  if [ -f "dev.log" ]; then
    recent_errors=$(tail -50 dev.log | grep -i "error\|failed\|exception" | wc -l)
    if [ "$recent_errors" -gt 0 ]; then
      echo "❌ $recent_errors erreur(s) récente(s) dans dev.log"
      tail -50 dev.log | grep -i "error\|failed\|exception" | head -3
    fi
  fi
}

# Fonction pour vérifier les erreurs HTTP
check_http_errors() {
  echo "$(date '+%H:%M:%S') - Vérification des erreurs HTTP..."
  
  http_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
  if [ "$http_status" = "200" ]; then
    echo "✅ Application accessible (HTTP 200)"
  else
    echo "❌ Erreur HTTP: $http_status"
  fi
}

# Boucle principale de monitoring
while true; do
  echo "----------------------------------------"
  capture_js_errors
  monitor_nextjs_logs
  check_http_errors
  echo "----------------------------------------"
  sleep 10
done
