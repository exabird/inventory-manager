# Guide de Développement Simplifié - Champs Produit

## 🎯 Objectif
Simplifier l'ajout de nouveaux champs produit pour éviter les itérations et bugs basiques.

## 📋 Processus Automatisé

### 1. Ajout d'un Nouveau Champ (5 minutes)

#### Option A: Script Automatique
```bash
cd scripts
./add-product-field.sh "warranty_period" "text" "Période de garantie"
```

#### Option B: Manuel (suivre le template)
1. **Migration Supabase** (1 min)
   ```sql
   ALTER TABLE products ADD COLUMN warranty_period text;
   COMMENT ON COLUMN products.warranty_period IS 'Période de garantie';
   ```

2. **Interface TypeScript** (2 min)
   - `src/lib/supabase.ts`: Ajouter `warranty_period: string | null;`
   - `ProductInspector.tsx`: Ajouter dans `ProductFormData`

3. **Composant UI** (1 min)
   ```tsx
   <FunctionalInput
     id="warranty_period"
     label="Période de garantie"
     value={formData.warranty_period || ''}
     onChange={(e) => handleInputChange('warranty_period', e.target.value)}
     placeholder="Ex: 2 ans"
     status={getFieldStatus('warranty_period')}
   />
   ```

4. **Statut Fonctionnel** (30 sec)
   - `src/lib/fieldStatus.ts`: `warranty_period: { functional: true }`

5. **Test** (30 sec)
   ```bash
   npm run build:check
   ```

### 2. Validation Automatique

#### Test Complet des Champs
```bash
cd scripts
./validate-product-fields.sh
```

#### Test Manuel Rapide
1. Créer un produit avec le nouveau champ
2. Vérifier la sauvegarde
3. Modifier le produit
4. Vérifier la mise à jour
5. Recharger la page
6. Vérifier la persistance

## 🛠️ Types de Champs Supportés

| Type | Composant | Exemple | Validation |
|------|-----------|---------|------------|
| `string` | `FunctionalInput` | Nom, Référence | Text |
| `number` | `FunctionalInput` | Prix, Quantité | Number |
| `text` | `FunctionalTextarea` | Description | Textarea |
| `boolean` | Checkbox | Actif/Inactif | Boolean |
| `date` | `FunctionalInput` | Date expiration | Date |
| `uuid` | `FunctionalSelect` | Catégorie | Select |

## 🔧 Checklist de Validation

### ✅ Avant de Commencer
- [ ] Champ défini clairement
- [ ] Type de données choisi
- [ ] Description rédigée

### ✅ Migration Base de Données
- [ ] Colonne ajoutée à `products`
- [ ] Commentaire ajouté
- [ ] Migration testée

### ✅ Interface TypeScript
- [ ] `Product` interface mise à jour
- [ ] `ProductFormData` interface mise à jour
- [ ] Types cohérents

### ✅ Composant UI
- [ ] Composant ajouté dans ProductInspector
- [ ] Initialisation correcte (`product?.field || default`)
- [ ] useEffect de mise à jour
- [ ] Statut fonctionnel défini

### ✅ Sauvegarde
- [ ] Création de produit testée
- [ ] Mise à jour de produit testée
- [ ] Persistance après rechargement

### ✅ Tests
- [ ] `npm run build:check` réussi
- [ ] Pas d'erreurs TypeScript
- [ ] Fonctionnalité testée manuellement

## 🚨 Erreurs Courantes à Éviter

### ❌ Chargement depuis metadata
```typescript
// MAUVAIS
brand: (product?.metadata as any)?.brand || '',

// BON
brand: product?.brand || '',
```

### ❌ Conversion || null sur chaînes vides
```typescript
// MAUVAIS
brand: formData.brand || null,  // Convertit "" en null

// BON
brand: formData.brand,  // Préserve les chaînes vides
```

### ❌ Oubli du useEffect
```typescript
// OBLIGATOIRE pour mettre à jour le formulaire
useEffect(() => {
  if (product) {
    setFormData({
      // ... tous les champs incluant le nouveau
    });
  }
}, [product]);
```

### ❌ Interface incohérente
```typescript
// Vérifier que les 3 interfaces sont cohérentes:
// 1. Product (supabase.ts)
// 2. ProductFormData (ProductInspector.tsx)
// 3. ProductFormData (page.tsx)
```

## 📊 Monitoring et Debug

### Logs de Debug
```typescript
console.log('🔍 Enregistrement du produit:', formData);
```

### Vérification Base de Données
```sql
SELECT name, [nouveau_champ] FROM products WHERE name = 'Test';
```

### Test de Persistance
1. Créer/modifier un produit
2. Recharger la page
3. Vérifier que les données sont toujours là

## 🎉 Résultat Attendu

Après avoir suivi ce processus :
- ✅ Nouveau champ fonctionnel en 5 minutes
- ✅ Aucune erreur de compilation
- ✅ Données persistantes
- ✅ Interface cohérente
- ✅ Tests validés

## 📚 Ressources

- **Template complet**: `docs/PRODUCT_FIELD_TEMPLATE.md`
- **Script automatique**: `scripts/add-product-field.sh`
- **Validation**: `scripts/validate-product-fields.sh`
- **Configuration champs**: `src/lib/fieldStatus.ts`
