#!/bin/bash

echo "🔍 Next.js Modern Debugging Tool"
echo "================================="
echo ""

# Fonction pour vérifier les erreurs avec les DevTools
check_errors_modern() {
  echo "$(date '+%H:%M:%S') - Vérification des erreurs avec DevTools..."
  
  # Vérifier si l'app répond
  if ! curl -s "http://localhost:3000" > /dev/null; then
    echo "❌ Application non accessible"
    return
  fi
  
  # Vérifier si l'inspecteur Node.js est actif
  if curl -s "http://localhost:9229/json" > /dev/null 2>&1; then
    echo "✅ Inspecteur Node.js actif sur le port 9229"
    echo "   🔗 Ouvrir chrome://inspect pour déboguer le serveur"
  else
    echo "⚠️  Inspecteur Node.js non actif"
    echo "   💡 Utilisez 'npm run dev:debug' pour activer le debugging"
  fi
  
  # Vérifier les erreurs dans le HTML (méthode légère)
  js_errors=$(curl -s "http://localhost:3000" | grep -o "console\.error\|console\.warn" | wc -l)
  
  if [ "$js_errors" -gt 0 ]; then
    echo "❌ $js_errors erreur(s) JavaScript détectée(s)"
    echo "   💡 Ouvrez les DevTools (F12) pour voir les détails"
  else
    echo "✅ Aucune erreur JavaScript détectée"
  fi
  
  # Vérifier les erreurs HTTP
  http_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
  if [ "$http_status" != "200" ]; then
    echo "❌ Erreur HTTP: $http_status"
  else
    echo "✅ Application accessible (HTTP 200)"
  fi
  
  echo ""
}

# Fonction pour afficher les instructions de debugging
show_debugging_instructions() {
  echo "📋 Instructions de debugging:"
  echo "1. Ouvrez Chrome et allez sur chrome://inspect"
  echo "2. Cliquez sur 'inspect' pour votre application Next.js"
  echo "3. Dans les DevTools, allez dans l'onglet 'Sources'"
  echo "4. Recherchez vos fichiers avec Ctrl+P (webpack://_N_E/./)"
  echo "5. Définissez des breakpoints et déboguez en temps réel"
  echo ""
}

# Vérifier immédiatement
check_errors_modern
show_debugging_instructions
