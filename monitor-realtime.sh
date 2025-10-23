#!/bin/bash

echo "🔍 Next.js Real-time Error Monitor"
echo "=================================="
echo ""

# Fonction pour capturer les erreurs en temps réel
monitor_errors() {
  echo "$(date '+%H:%M:%S') - Monitoring des erreurs..."
  
  # Vérifier les erreurs dans les logs Next.js
  if [ -f "dev.log" ]; then
    errors=$(tail -20 dev.log | grep -i "error\|failed\|exception" | wc -l)
    if [ "$errors" -gt 0 ]; then
      echo "❌ $errors erreur(s) dans les logs Next.js:"
      tail -20 dev.log | grep -i "error\|failed\|exception" | head -3
    fi
  fi
  
  # Vérifier les erreurs HTTP
  http_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
  if [ "$http_status" != "200" ]; then
    echo "❌ Erreur HTTP: $http_status"
  fi
  
  # Vérifier les erreurs dans le HTML
  html_errors=$(curl -s "http://localhost:3000" | grep -o "error\|Error\|ERROR\|undefined\|null" | wc -l)
  if [ "$html_errors" -gt 0 ]; then
    echo "❌ $html_errors erreur(s) dans le HTML"
  fi
  
  echo ""
}

# Boucle de monitoring
while true; do
  monitor_errors
  sleep 5
done
