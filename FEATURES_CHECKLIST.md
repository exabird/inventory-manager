# Checklist des fonctionnalités - ProductInspector

Version de référence: ProductInspector.tsx (Version 0.1.12, Janvier 2025)

## 📋 À vérifier AVANT chaque commit majeur

### 1. Imports critiques (Minimum requis)

- [x] AILabelWithButton
- [ ] RichTextEditor  
- [x] TechnicalSpecifications (type)
- [ ] TechnicalSpecsEditor
- [x] Brand (type)
- [x] BrandService
- [x] ProductImageService
- [x] UnifiedAIFetchButton

### 2. Interface ProductFormData

**Champs obligatoires:**
- [x] id: string
- [x] name: string
- [x] internal_ref: string
- [x] barcode: string | null
- [x] brand: string | null
- [x] manufacturer: string | null
- [x] manufacturer_ref: string | null
- [x] short_description: string | null
- [x] quantity: number
- [x] category_id: string | null
- [x] selling_price_htva: number | null
- [x] purchase_price_htva: number | null
- [x] warranty_period: string | null
- [x] min_stock_required: boolean | null
- [x] min_stock_quantity: number | null
- [ ] long_description: string | null (À AJOUTER)
- [ ] technical_specifications: TechnicalSpecifications | null (À AJOUTER)
- [x] metadata: object

### 3. États React (Minimum requis)

- [x] formData
- [x] hasChanges
- [x] isLoading
- [x] categories, isLoadingCategories
- [x] validationErrors
- [x] aiProgress (pour UnifiedAIFetchButton)
- [x] isAILoading
- [x] images
- [x] showScanner
- [ ] aiFilledFields (Set<string>) - Pour marquer les champs remplis par IA
- [ ] brand_id dans formData

### 4. Fonctions IA

- [x] handleUnifiedAIFetch (VERSION AMÉLIORÉE - métadonnées + images + classification)
- [ ] handleAIFieldFill - Pour remplissage individuel par champ via AILabelWithButton

### 5. UI - Onglets

#### Onglet Favoris
- [x] Nom du produit (Input)
- [x] Référence interne (Input)
- [x] Code-barres (Input avec scanner)
- [x] Référence fabricant (Input)
- [ ] Description courte avec AILabelWithButton
- [ ] Description longue avec RichTextEditor + AILabelWithButton
- [ ] Garantie avec AILabelWithButton
- [x] Quantité en stock
- [x] Prix de vente HTVA
- [x] Prix d'achat HTVA

#### Onglet Stock
- [x] StockTab complet avec historique

#### Onglet Specs (Spécifications Techniques)
- [ ] **TechnicalSpecsEditor** (PRIORITAIRE - MANQUANT)
  - Champs techniques individuels
  - Boutons IA individuels sur chaque champ
  - Types de champs: text, number, boolean, date
- [x] Métadonnées de base (poids, dimensions, etc.) - Alternative actuelle

#### Onglet Images
- [x] Galerie d'images
- [x] Upload d'images
- [x] Classification d'images par IA
- [x] Sélection image principale

### 6. Boutons IA dans le Header

- [x] **UnifiedAIFetchButton** (3 modes: Metas, Images, All)
  - Mode Metas : Remplit UNIQUEMENT les champs vides
  - Mode Images : Récupère et classifie les images
  - Mode All : Les deux
- [ ] Boutons IA individuels sur les champs (AILabelWithButton) - Visible au hover

### 7. Select Marques

- [ ] Select dropdown pour `brand_id` au lieu d'Input texte pour `brand`
- [x] Service BrandService pour récupérer les marques
- [ ] État `brands` et `isLoadingBrands`

## 🔍 Commande rapide de vérification

```bash
# Nombre de lignes (référence: ~1400-1500 pour version actuelle)
wc -l inventory-app/src/components/inventory/ProductInspector.tsx

# Vérifier imports critiques (doit retourner au moins 3)
grep -c "AILabelWithButton\|TechnicalSpecsEditor\|RichTextEditor" inventory-app/src/components/inventory/ProductInspector.tsx

# Vérifier que handleUnifiedAIFetch existe (doit retourner 1)
grep -c "const handleUnifiedAIFetch = async" inventory-app/src/components/inventory/ProductInspector.tsx

# Vérifier 0 erreur TypeScript
cd inventory-app && npm run type-check
```

## 📊 Métriques de référence

| Métrique | Valeur actuelle | Valeur cible |
|----------|-----------------|--------------|
| Lignes de code | ~1376 | ~2300 |
| Imports | 29 | 35+ |
| États React | 14 | 18+ |
| Fonctions principales | 12 | 15+ |
| Onglets | 4 | 4 |
| Erreurs TypeScript | 0 | 0 |

## ⚠️ Features manquantes critiques (Version actuelle)

### 🔴 Priorité HAUTE

1. **TechnicalSpecsEditor dans onglet Specs**
   - Composant existe : ✅ `src/components/inventory/TechnicalSpecsEditor.tsx`
   - Intégré dans ProductInspector : ❌ 
   - Action requise : Remplacer les inputs basiques de métadonnées par TechnicalSpecsEditor

2. **AILabelWithButton sur tous les champs**
   - Composant existe : ✅ `src/components/ui/AILabelWithButton.tsx`
   - Intégré partout : ❌ (seulement dans TechnicalSpecsEditor)
   - Action requise : Ajouter sur tous les champs de tous les onglets

3. **Champs ProductFormData manquants**
   - `long_description: string | null`
   - `technical_specifications: TechnicalSpecifications | null`
   - Action requise : Ajouter à l'interface

### 🟡 Priorité MOYENNE

4. **RichTextEditor pour description longue**
   - Composant existe : ✅ `src/components/ui/RichTextEditor.tsx`
   - Intégré : ❌
   - Action requise : Remplacer textarea par RichTextEditor

5. **Select marques avec brand_id**
   - Service existe : ✅ BrandService
   - UI implémentée : ❌ (utilise Input texte)
   - Action requise : Remplacer Input par Select avec brand_id

6. **État aiFilledFields**
   - But : Marquer visuellement les champs remplis par IA
   - Implémenté : ❌
   - Action requise : Ajouter `const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set())`

### 🟢 Améliorations futures

7. **Polling des images après fetch IA**
   - Pour rafraîchir automatiquement après classification
   
8. **Badges "IA" sur les champs remplis**
   - Indicateur visuel de remplissage automatique

## 🛠️ Plan d'action pour complétion

```bash
# Étape 1: Ajouter les champs manquants à ProductFormData
# Fichier: src/components/inventory/ProductInspector.tsx
# Ajouter: long_description, technical_specifications, brand_id

# Étape 2: Intégrer TechnicalSpecsEditor dans onglet Specs
# Remplacer le contenu actuel du case 'specs' par <TechnicalSpecsEditor />

# Étape 3: Ajouter AILabelWithButton sur tous les champs
# Wraper chaque Label par AILabelWithButton

# Étape 4: Remplacer Input brand par Select brand_id
# Charger les marques et afficher un Select

# Étape 5: Ajouter RichTextEditor pour long_description
# Dans onglet Favoris ou nouveau champ

# Étape 6: Tests complets
cd inventory-app && npm run type-check && npm run build:check
```

## 📚 Documentation associée

- `inventory-app/docs/ARCHITECTURE_GUIDE.md` - Architecture complète
- `inventory-app/AGENTS.md` - Instructions pour l'agent
- `inventory-app/src/components/inventory/TechnicalSpecsEditor.tsx` - Référence pour l'intégration
- `inventory-app/src/components/ui/AILabelWithButton.tsx` - Référence pour les boutons IA

## ✅ Comment utiliser cette checklist

1. Avant chaque modification majeure de ProductInspector.tsx :
   - Lire cette checklist
   - Noter les features actuellement présentes
   - Identifier ce qui pourrait être perdu

2. Après modification :
   - Relire la checklist
   - Vérifier que rien n'a été supprimé par inadvertance
   - Exécuter les commandes de vérification

3. Avant chaque commit :
   - Exécuter `./scripts/check-features.sh` (si créé)
   - Confirmer 0 erreur TypeScript
   - Tester visuellement tous les onglets

## 🚨 Signaux d'alerte

Si vous observez :
- ❌ Nombre de lignes < 1300 → Investigation requise
- ❌ Imports < 25 → Des composants ont été supprimés
- ❌ Erreurs TypeScript → Stop immédiatement
- ❌ Un onglet ne s'affiche pas → Vérifier renderTabContent()
- ❌ Boutons IA invisibles → Vérifier les imports AILabelWithButton/UnifiedAIFetchButton

➡️ **Action : Restaurer depuis le dernier backup fonctionnel**

