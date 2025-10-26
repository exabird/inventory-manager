#!/bin/bash

echo "🔥 RESET COMPLET DE L'APPLICATION"
echo "=================================="
echo ""

# 1. Tuer le serveur
echo "1️⃣ Arrêt du serveur..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 2
echo "   ✅ Serveur arrêté"
echo ""

# 2. Supprimer tous les caches
echo "2️⃣ Suppression des caches..."
rm -rf .next
rm -rf node_modules/.cache
echo "   ✅ Caches supprimés"
echo ""

# 3. Rebuild complet
echo "3️⃣ Rebuild complet..."
npm run build 2>&1 | tail -5
echo "   ✅ Build terminé"
echo ""

# 4. Redémarrage
echo "4️⃣ Démarrage du serveur..."
npm run dev &
sleep 8
echo "   ✅ Serveur démarré sur http://localhost:3000"
echo ""

echo "=================================="
echo "✅ RESET TERMINÉ !"
echo ""
echo "📱 MAINTENANT DANS VOTRE NAVIGATEUR :"
echo "   1. Cmd + Shift + R (hard refresh)"
echo "   2. OU : Ouvrir DevTools (F12)"
echo "        → Clic DROIT sur refresh 🔄"
echo "        → 'Vider le cache et actualiser'"
echo ""
echo "🔍 VÉRIFICATIONS :"
echo "   • Sidebar en bas : 'Stocky v0.1.40' ?"
echo "   • Bouton IA : Pas de point noir ?"
echo "   • Hover bouton IA (sans cliquer) : PAS de tooltip ?"
echo ""

