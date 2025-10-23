#!/bin/bash

echo "🔍 Capturing JavaScript errors from HTML..."

# Fonction pour vérifier les erreurs JavaScript
check_js_errors() {
  echo "$(date '+%H:%M:%S') - Vérification des erreurs JavaScript..."
  
  # Vérifier si l'app répond
  if ! curl -s "http://localhost:3000" > /dev/null; then
    echo "❌ Application non accessible"
    return
  fi
  
  # Récupérer le HTML et chercher les erreurs JavaScript
  html=$(curl -s "http://localhost:3000")
  
  # Chercher les erreurs JavaScript spécifiques
  js_errors=$(echo "$html" | grep -o "console\.error\|console\.warn\|throw new Error\|Error:" | wc -l)
  
  if [ "$js_errors" -gt 0 ]; then
    echo "❌ $js_errors erreur(s) JavaScript détectée(s) dans le HTML"
    echo "$html" | grep -o "console\.error\|console\.warn\|throw new Error\|Error:" | head -3
  else
    echo "✅ Aucune erreur JavaScript détectée dans le HTML"
  fi
  
  # Vérifier les erreurs de requête (404, 500, etc.)
  http_errors=$(echo "$html" | grep -o "404\|500\|502\|503" | wc -l)
  if [ "$http_errors" -gt 0 ]; then
    echo "❌ $http_errors erreur(s) HTTP détectée(s)"
    echo "$html" | grep -o "404\|500\|502\|503" | head -3
  fi
  
  echo ""
}

# Vérifier immédiatement
check_js_errors
