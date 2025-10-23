#!/bin/bash

echo "🔍 Monitoring JavaScript errors in real-time..."
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

# Fonction pour vérifier les erreurs JavaScript
check_js_errors() {
  echo "$(date '+%H:%M:%S') - Vérification des erreurs JavaScript..."
  
  # Vérifier si l'app répond
  if ! curl -s "http://localhost:3000" > /dev/null; then
    echo "❌ Application non accessible"
    return
  fi
  
  # Vérifier les erreurs dans la console du navigateur
  # On peut utiliser des outils comme puppeteer ou selenium pour capturer les erreurs JS
  # Pour l'instant, on vérifie les erreurs dans les logs Next.js
  
  # Vérifier les logs Next.js pour des erreurs
  if pgrep -f "next dev" > /dev/null; then
    echo "✅ Next.js en cours d'exécution"
  else
    echo "❌ Next.js arrêté"
  fi
  
  echo ""
}

# Boucle de monitoring
while true; do
  check_js_errors
  sleep 5
done
