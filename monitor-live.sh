#!/bin/bash

echo "🔍 Next.js Real-time Error Monitor - ACTIF"
echo "=========================================="
echo ""

# Fonction pour capturer et afficher les erreurs
capture_and_display_errors() {
  timestamp=$(date '+%H:%M:%S')
  echo "[$timestamp] Vérification des erreurs..."
  
  # Vérifier les erreurs HTTP
  http_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
  if [ "$http_status" != "200" ]; then
    echo "❌ [$timestamp] Erreur HTTP: $http_status"
  fi
  
  # Vérifier les erreurs dans le HTML
  html_content=$(curl -s "http://localhost:3000")
  errors=$(echo "$html_content" | grep -o "error\|Error\|ERROR" | wc -l)
  undefineds=$(echo "$html_content" | grep -o "undefined" | wc -l)
  nulls=$(echo "$html_content" | grep -o "null" | wc -l)
  
  if [ "$errors" -gt 0 ] || [ "$undefineds" -gt 0 ] || [ "$nulls" -gt 0 ]; then
    echo "❌ [$timestamp] Erreurs détectées:"
    echo "   - Errors: $errors"
    echo "   - Undefined: $undefineds" 
    echo "   - Null: $nulls"
    
    # Afficher les premières erreurs trouvées
    if [ "$errors" -gt 0 ]; then
      echo "   - Exemples d'erreurs:"
      echo "$html_content" | grep -o "error\|Error\|ERROR" | head -3 | sed 's/^/     /'
    fi
  else
    echo "✅ [$timestamp] Aucune erreur détectée"
  fi
  
  echo ""
}

# Boucle de monitoring continue
echo "🚀 Démarrage du monitoring en temps réel..."
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

while true; do
  capture_and_display_errors
  sleep 10
done
