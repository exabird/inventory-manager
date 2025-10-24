# 🚀 Installation du Système de Marques

**Date** : 24 octobre 2025  
**Version** : 0.1.35

---

## ✅ Fichiers Créés/Modifiés

### 📄 Nouveaux Fichiers

1. **`docs/database-migration-brands.sql`**
   - Migration SQL pour créer la table `brands`
   - Ajout FK `brand_id` à `products`
   - Migration automatique des données existantes
   - Exemples de données (Sonos, UniFi, Apple, Samsung)

2. **`src/app/brands/page.tsx`**
   - Page de gestion des marques
   - Interface CRUD complète
   - Formulaire avec instructions IA

3. **`SYSTEME_MARQUES.md`**
   - Documentation complète du système
   - Exemples de prompts IA
   - Guide d'utilisation

4. **`INSTALLATION_SYSTEME_MARQUES.md`** (ce fichier)
   - Instructions d'installation
   - Checklist complète

---

### 📝 Fichiers Modifiés

1. **`src/lib/supabase.ts`**
   - Ajout interface `Brand`
   - Ajout `brand_id` à l'interface `Product`

2. **`src/lib/services.ts`**
   - Ajout `BrandService` (CRUD complet)
   - Import de `Brand`

3. **`src/components/layout/Sidebar.tsx`**
   - Ajout menu "Marques" (icône `Building2`)
   - Lien vers `/brands`

4. **`src/components/inventory/ProductInspector.tsx`** (futur)
   - À modifier pour utiliser dropdown marques

5. **`src/app/api/ai-fill/route.ts`** (futur)
   - À modifier pour intégrer `ai_fetch_prompt`

---

## 🛠️ Étapes d'Installation

### Étape 1 : Exécuter la Migration SQL

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Ouvrir l'éditeur SQL
3. Copier le contenu de `docs/database-migration-brands.sql`
4. Exécuter la migration
5. Vérifier :
   ```sql
   SELECT * FROM brands;
   ```

**Résultat attendu** :
- ✅ Table `brands` créée
- ✅ Colonne `brand_id` ajoutée à `products`
- ✅ 4+ marques exemple créées (Sonos, UniFi, Apple, Samsung)
- ✅ Produits existants liés automatiquement

---

### Étape 2 : Vérifier TypeScript

```bash
cd inventory-app
npm run type-check
```

**Résultat attendu** :
- ✅ 0 erreur TypeScript

---

### Étape 3 : Tester Localement

```bash
npm run dev
```

1. Naviguer vers `http://localhost:3000/brands`
2. Vérifier que la page s'affiche
3. Vérifier que les marques exemple sont affichées
4. Tester l'ajout d'une nouvelle marque
5. Tester l'édition d'une marque
6. Vérifier le menu "Marques" dans la sidebar

---

### Étape 4 : Configurer les Prompts IA

Pour chaque marque importante :

1. Aller sur `/brands`
2. Cliquer sur "Modifier" (icône crayon)
3. Remplir le champ **"Instructions IA pour le fetch automatique"**

**Exemples de prompts** :

#### Sonos
```
Chercher les informations produit sur https://www.sonos.com/fr-be/shop/. 
Les images produit sont disponibles en haute résolution. 
Extraire le nom exact, les spécifications techniques complètes (WiFi, 
Bluetooth, puissance, dimensions) et toutes les images disponibles.
```

#### UniFi
```
Chercher les informations produit sur https://ui.com ou https://store.ui.com. 
Les fiches produit contiennent des spécifications techniques détaillées. 
Extraire tous les détails réseau (ports Ethernet, PoE, débit, WiFi), 
dimensions, puissance et toutes les images produit.
```

#### Apple
```
Chercher sur https://www.apple.com/be/fr/. 
Les pages produit Apple contiennent des images haute résolution et des 
spécifications détaillées. Extraire le modèle exact, la capacité de stockage, 
la couleur, les dimensions, le poids et toutes les images produit.
```

---

## 🔗 Phase 2 : Intégration Fetch IA

### Modifications à Apporter

#### 1. Modifier `src/app/api/ai-fill/route.ts`

**Avant** :
```typescript
const prompt = `
Cherche les informations du produit "${productName}".
`;
```

**Après** :
```typescript
// Récupérer la marque si disponible
let brandPrompt = '';
if (productData.brand_id) {
  const { BrandService } = await import('@/lib/services');
  const brand = await BrandService.getById(productData.brand_id);
  if (brand?.ai_fetch_prompt) {
    brandPrompt = `
🔍 INSTRUCTIONS SPÉCIFIQUES MARQUE "${brand.name}":
${brand.ai_fetch_prompt}

`;
  }
}

const prompt = `
${brandPrompt}
Cherche les informations du produit "${productName}".
`;
```

#### 2. Modifier `src/components/inventory/ProductInspector.tsx`

Remplacer le champ texte `brand` par un dropdown `brand_id` :

```typescript
// Charger les marques
const [brands, setBrands] = useState<Brand[]>([]);

useEffect(() => {
  const loadBrands = async () => {
    const data = await BrandService.getAll();
    setBrands(data);
  };
  loadBrands();
}, []);

// Dans le formulaire
<Label htmlFor="brand_id">Marque</Label>
<select
  id="brand_id"
  value={formData.brand_id || ''}
  onChange={(e) => handleInputChange('brand_id', e.target.value)}
>
  <option value="">Sélectionner une marque...</option>
  {brands.map(brand => (
    <option key={brand.id} value={brand.id}>
      {brand.name}
    </option>
  ))}
</select>
```

---

## ✅ Checklist Complète

### Installation
- [ ] Migration SQL exécutée
- [ ] Table `brands` créée
- [ ] Colonne `brand_id` ajoutée à `products`
- [ ] Marques exemple créées
- [ ] TypeScript : 0 erreur
- [ ] Build production : OK

### Configuration
- [ ] Page `/brands` accessible
- [ ] Menu "Marques" visible dans sidebar
- [ ] Ajout de marque fonctionne
- [ ] Édition de marque fonctionne
- [ ] Suppression de marque fonctionne

### Prompts IA
- [ ] Prompt Sonos configuré
- [ ] Prompt UniFi configuré
- [ ] Prompt Apple configuré
- [ ] Prompt Samsung configuré

### Intégration Fetch IA (Phase 2)
- [ ] `/api/ai-fill` modifié pour utiliser `ai_fetch_prompt`
- [ ] ProductInspector modifié (dropdown marques)
- [ ] Tests effectués
- [ ] Comparaison avant/après documentée

---

## 🧪 Tests de Validation

### Test 1 : CRUD Marques

1. Créer une marque "Test Brand"
2. Vérifier qu'elle apparaît dans la liste
3. Éditer le prompt IA
4. Vérifier que les changements sont sauvegardés
5. Supprimer la marque
6. Vérifier qu'elle n'apparaît plus

### Test 2 : Fetch IA Sans Prompt

1. Créer un produit lié à une marque SANS prompt IA
2. Lancer le fetch IA
3. Observer les résultats (standard)

### Test 3 : Fetch IA Avec Prompt

1. Créer un produit lié à une marque AVEC prompt IA
2. Lancer le fetch IA
3. Observer les résultats (améliorés)
4. Comparer avec Test 2

**Résultats attendus** :
- ✅ Plus d'images trouvées
- ✅ Métadonnées plus complètes
- ✅ Sources correctes

---

## 📊 Métriques de Succès

| KPI | Cible |
|-----|-------|
| Images/produit | +200% |
| Specs complètes | 80%+ |
| Précision source | 90%+ |
| Temps config | -50% |

---

## 🐛 Problèmes Potentiels

### Problème 1 : Migration échoue

**Cause** : Produits avec `brand` NULL  
**Solution** : Vérifier la clause `WHERE brand IS NOT NULL`

### Problème 2 : Marques pas affichées

**Cause** : RLS (Row Level Security) mal configuré  
**Solution** : Vérifier les politiques RLS dans Supabase

### Problème 3 : Fetch IA ne s'améliore pas

**Cause** : `/api/ai-fill` pas encore modifié  
**Solution** : Appliquer les modifications de la Phase 2

---

## 📚 Documentation

- **Guide complet** : `SYSTEME_MARQUES.md`
- **Migration SQL** : `docs/database-migration-brands.sql`
- **API Reference** : Voir `BrandService` dans `src/lib/services.ts`

---

## 🎯 Résumé

Le système de marques est **prêt à installer** ! 

**Étapes minimales** :
1. Exécuter migration SQL
2. Tester page `/brands`
3. Configurer prompts IA pour marques principales
4. (Phase 2) Intégrer dans `/api/ai-fill`

**Temps estimé** : 30 minutes

**Impact attendu** : **Amélioration drastique du fetch IA** 🚀

---

**Prêt à installer ? Commencez par la migration SQL ! 🎉**

