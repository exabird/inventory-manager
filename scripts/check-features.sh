#!/bin/bash

# Script de vérification des features de ProductInspector.tsx
# À exécuter AVANT chaque commit majeur

set -e

FILE="src/components/inventory/ProductInspector.tsx"
REFERENCE_MIN_LINES=1300
REFERENCE_MAX_LINES=2600

echo "📊 Vérification ProductInspector"
echo "================================"

# Vérifier que le fichier existe
if [ ! -f "$FILE" ]; then
    echo "❌ ERREUR: $FILE n'existe pas!"
    exit 1
fi

# Compter lignes
CURRENT=$(wc -l < "$FILE")
echo "📄 Lignes actuelles: $CURRENT"
echo "📄 Référence: $REFERENCE_MIN_LINES-$REFERENCE_MAX_LINES lignes"

if [ $CURRENT -lt $REFERENCE_MIN_LINES ]; then
    echo "⚠️  ATTENTION: Seulement $CURRENT lignes (< $REFERENCE_MIN_LINES)"
    echo "   Des features ont peut-être été supprimées!"
    echo "   Consultez FEATURES_CHECKLIST.md"
    exit 1
fi

if [ $CURRENT -gt $REFERENCE_MAX_LINES ]; then
    echo "⚠️  INFO: $CURRENT lignes (> $REFERENCE_MAX_LINES)"
    echo "   Le fichier est peut-être trop gros, envisager de découper"
fi

# Vérifier imports critiques
echo ""
echo "🔍 Vérification des imports critiques..."

IMPORTS=$(grep -c "import.*AILabelWithButton\|import.*TechnicalSpecsEditor\|import.*UnifiedAIFetchButton" "$FILE" || true)

echo "   - Composants IA trouvés: $IMPORTS"

if [ $IMPORTS -lt 1 ]; then
    echo "❌ ERREUR: Aucun composant IA trouvé!"
    echo "   AILabelWithButton, TechnicalSpecsEditor ou UnifiedAIFetchButton manquants"
    exit 1
fi

# Vérifier handleUnifiedAIFetch
UNIFIED_FETCH=$(grep -c "const handleUnifiedAIFetch = async" "$FILE" || true)

if [ $UNIFIED_FETCH -eq 0 ]; then
    echo "❌ ERREUR: handleUnifiedAIFetch manquant!"
    exit 1
elif [ $UNIFIED_FETCH -gt 1 ]; then
    echo "⚠️  ATTENTION: handleUnifiedAIFetch défini $UNIFIED_FETCH fois (duplication?)"
fi

echo "   - handleUnifiedAIFetch: ✅"

# Vérifier les onglets
echo ""
echo "🔍 Vérification des onglets..."

TABS_FOUND=$(grep -c "case 'favorites':\|case 'stock':\|case 'specs':\|case 'images':" "$FILE" || true)

if [ $TABS_FOUND -lt 4 ]; then
    echo "⚠️  ATTENTION: Seulement $TABS_FOUND/4 onglets trouvés"
else
    echo "   - Onglets: ✅ ($TABS_FOUND/4)"
fi

# TypeScript check
echo ""
echo "🔍 Vérification TypeScript..."
cd "$(dirname "$0")/.."
npm run type-check > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   - TypeScript: ✅ (0 erreur)"
else
    echo "❌ ERREUR: Erreurs TypeScript détectées"
    npm run type-check
    exit 1
fi

echo ""
echo "✅ Toutes les vérifications sont passées!"
echo ""
echo "📋 Checklist complète:"
echo "   - Lignes: $CURRENT (OK)"
echo "   - Imports IA: $IMPORTS (OK)"
echo "   - handleUnifiedAIFetch: Présent"
echo "   - Onglets: $TABS_FOUND/4"
echo "   - TypeScript: 0 erreur"
echo ""
echo "💡 Pour une vérification complète, consultez FEATURES_CHECKLIST.md"

