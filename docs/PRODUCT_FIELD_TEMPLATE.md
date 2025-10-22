/**
 * Template pour ajouter un nouveau champ produit
 * 
 * Étapes à suivre :
 * 1. Ajouter la colonne en base de données
 * 2. Mettre à jour les interfaces TypeScript
 * 3. Ajouter le composant dans ProductInspector
 * 4. Tester la fonctionnalité
 */

// ========================================
// 1. MIGRATION SUPABASE
// ========================================
/*
-- Exécuter cette migration sur Supabase
ALTER TABLE products 
ADD COLUMN [FIELD_NAME] [DATA_TYPE];

COMMENT ON COLUMN products.[FIELD_NAME] IS '[DESCRIPTION]';
*/

// ========================================
// 2. INTERFACE PRODUCT (src/lib/supabase.ts)
// ========================================
/*
export interface Product {
  // ... champs existants ...
  [FIELD_NAME]: [DATA_TYPE] | null;
}
*/

// ========================================
// 3. INTERFACE PRODUCTFORMDATA (ProductInspector.tsx)
// ========================================
/*
interface ProductFormData {
  // ... champs existants ...
  [FIELD_NAME]: [DATA_TYPE] | null;
}
*/

// ========================================
// 4. INITIALISATION DU FORMULAIRE (ProductInspector.tsx)
// ========================================
/*
// Dans useState initial :
[FIELD_NAME]: product?.[FIELD_NAME] || [DEFAULT_VALUE],

// Dans useEffect de mise à jour :
[FIELD_NAME]: product.[FIELD_NAME] || [DEFAULT_VALUE],
*/

// ========================================
// 5. COMPOSANT DE CHAMP (ProductInspector.tsx)
// ========================================
/*
<FunctionalInput
  id="[FIELD_NAME]"
  label="[DESCRIPTION]"
  value={formData.[FIELD_NAME] || ''}
  onChange={(e) => handleInputChange('[FIELD_NAME]', e.target.value)}
  placeholder="Saisir [DESCRIPTION]..."
  status={getFieldStatus('[FIELD_NAME]')}
/>
*/

// ========================================
// 6. STATUT DU CHAMP (src/lib/fieldStatus.ts)
// ========================================
/*
[FIELD_NAME]: { functional: true },
*/

// ========================================
// 7. CRÉATION DE PRODUIT (page.tsx)
// ========================================
/*
// Dans ProductService.create :
[FIELD_NAME]: data.[FIELD_NAME],
*/

// ========================================
// 8. TYPES DE DONNÉES COURANTS
// ========================================
/*
string     -> Input text
number     -> Input number
boolean    -> Checkbox
date       -> Input date
text       -> Textarea
uuid       -> Select (référence)
*/

// ========================================
// 9. EXEMPLE COMPLET
// ========================================
/*
Champ: warranty_period (période de garantie)
Type: text
Description: "Période de garantie"

1. Migration:
   ALTER TABLE products ADD COLUMN warranty_period text;
   COMMENT ON COLUMN products.warranty_period IS 'Période de garantie';

2. Interface Product:
   warranty_period: string | null;

3. Interface ProductFormData:
   warranty_period: string | null;

4. Initialisation:
   warranty_period: product?.warranty_period || '',

5. Composant:
   <FunctionalInput
     id="warranty_period"
     label="Période de garantie"
     value={formData.warranty_period || ''}
     onChange={(e) => handleInputChange('warranty_period', e.target.value)}
     placeholder="Ex: 2 ans"
     status={getFieldStatus('warranty_period')}
   />

6. Statut:
   warranty_period: { functional: true },

7. Création:
   warranty_period: data.warranty_period,
*/
