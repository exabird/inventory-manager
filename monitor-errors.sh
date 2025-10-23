#!/bin/bash

echo "🔍 Monitoring Next.js errors..."
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

# Fonction pour vérifier les erreurs
check_errors() {
  echo "$(date '+%H:%M:%S') - Vérification des erreurs..."
  
  # Vérifier si l'app répond
  if ! curl -s "http://localhost:3000" > /dev/null; then
    echo "❌ Application non accessible"
    return
  fi
  
  # Vérifier les erreurs dans le HTML
  errors=$(curl -s "http://localhost:3000" | grep -o "error\|Error\|ERROR\|undefined\|null" | wc -l)
  if [ "$errors" -gt 0 ]; then
    echo "❌ $errors erreur(s) détectée(s) dans le HTML"
    curl -s "http://localhost:3000" | grep -o "error\|Error\|ERROR\|undefined\|null" | head -3
  else
    echo "✅ Aucune erreur détectée dans le HTML"
  fi
  
  echo ""
}

# Boucle de monitoring
while true; do
  check_errors
  sleep 10
done
