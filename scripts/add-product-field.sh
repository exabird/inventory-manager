#!/bin/bash

# Script automatisé pour ajouter de nouveaux champs produit
# Usage: ./add-product-field.sh "field_name" "data_type" "description"

FIELD_NAME=$1
DATA_TYPE=$2
DESCRIPTION=$3

if [ -z "$FIELD_NAME" ] || [ -z "$DATA_TYPE" ] || [ -z "$DESCRIPTION" ]; then
    echo "Usage: $0 <field_name> <data_type> <description>"
    echo "Example: $0 \"warranty_period\" \"text\" \"Période de garantie\""
    exit 1
fi

echo "🔧 Ajout du champ: $FIELD_NAME ($DATA_TYPE) - $DESCRIPTION"

# 1. Ajouter la colonne à la table products
echo "📊 Ajout de la colonne à Supabase..."
cat > "migration_add_${FIELD_NAME}.sql" << EOF
-- Migration: Ajout du champ $FIELD_NAME
-- Description: $DESCRIPTION
-- Date: $(date)

ALTER TABLE products 
ADD COLUMN $FIELD_NAME $DATA_TYPE;

-- Commentaire sur la colonne
COMMENT ON COLUMN products.$FIELD_NAME IS '$DESCRIPTION';
EOF

echo "✅ Migration SQL créée: migration_add_${FIELD_NAME}.sql"

# 2. Mettre à jour l'interface TypeScript
echo "📝 Mise à jour de l'interface Product..."
cat >> "interface_update_${FIELD_NAME}.ts" << EOF
// Ajout du champ $FIELD_NAME à l'interface Product
// Description: $DESCRIPTION

// Dans src/lib/supabase.ts - interface Product:
$FIELD_NAME: $DATA_TYPE | null;

// Dans src/components/inventory/ProductInspector.tsx - interface ProductFormData:
$FIELD_NAME: $DATA_TYPE | null;

// Dans src/lib/fieldStatus.ts - FIELD_STATUS_CONFIG:
$FIELD_NAME: { functional: true },
EOF

echo "✅ Interface TypeScript mise à jour: interface_update_${FIELD_NAME}.ts"

# 3. Générer le composant de champ
echo "🎨 Génération du composant de champ..."
cat > "field_component_${FIELD_NAME}.tsx" << EOF
// Composant pour le champ $FIELD_NAME
// Description: $DESCRIPTION

<FunctionalInput
  id="$FIELD_NAME"
  label="$DESCRIPTION"
  value={formData.$FIELD_NAME || ''}
  onChange={(e) => handleInputChange('$FIELD_NAME', e.target.value)}
  placeholder="Saisir $DESCRIPTION..."
  status={getFieldStatus('$FIELD_NAME')}
/>
EOF

echo "✅ Composant de champ généré: field_component_${FIELD_NAME}.tsx"

# 4. Instructions de déploiement
echo "📋 Instructions de déploiement:"
echo "1. Exécuter la migration SQL sur Supabase"
echo "2. Mettre à jour les interfaces TypeScript"
echo "3. Ajouter le composant dans ProductInspector"
echo "4. Tester la fonctionnalité"
echo "5. Supprimer les fichiers temporaires"

echo "🎉 Script terminé pour le champ: $FIELD_NAME"
