#!/bin/bash

echo "🚀 Next.js Quick Health Check"
echo "============================="

# Fonction de vérification rapide
quick_check() {
  echo "$(date '+%H:%M:%S') - Vérification rapide..."
  
  # Vérifier l'application
  if curl -s "http://localhost:3000" > /dev/null; then
    echo "✅ Application accessible"
  else
    echo "❌ Application non accessible"
    return 1
  fi
  
  # Vérifier l'inspecteur Node.js
  if curl -s "http://localhost:9229/json" > /dev/null 2>&1; then
    echo "✅ Inspecteur Node.js actif"
    echo "   🔗 chrome://inspect disponible"
  else
    echo "⚠️  Inspecteur Node.js non actif"
  fi
  
  # Vérification légère des erreurs
  errors=$(curl -s "http://localhost:3000" | grep -o "console\.error\|console\.warn" | wc -l)
  if [ "$errors" -gt 0 ]; then
    echo "⚠️  $errors erreur(s) JavaScript détectée(s)"
    echo "   💡 Utilisez chrome://inspect pour déboguer"
  else
    echo "✅ Aucune erreur JavaScript détectée"
  fi
  
  echo ""
}

# Exécuter la vérification
quick_check

# Afficher les URLs utiles
echo "🔗 URLs utiles:"
echo "   Application: http://localhost:3000"
echo "   Inspecteur: chrome://inspect"
echo "   DevTools: F12 dans le navigateur"
echo ""
