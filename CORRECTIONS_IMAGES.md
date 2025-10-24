# Corrections Images - Fond Blanc & Classification

## 🎯 Problèmes Corrigés

### 1. ✅ PNG Transparent → JPG avec Fond Noir

**Problème** : Les images PNG transparentes étaient converties en JPG avec fond noir.

**Cause** : Tentative d'ajouter `bg=white` aux URLs, mais le CDN Sonos ne supporte pas ce paramètre (→ HTTP 400).

**Solution** : Traitement côté serveur avec `sharp` :
- PNG transparent → Conversion en JPG avec fond blanc `#FFFFFF`
- WEBP → Conversion en JPG optimisé
- Autres formats → Optimisation légère

**Fichiers modifiés** :
- `src/app/api/download-images/route.ts` : Utilise `sharp.flatten({ background: { r: 255, g: 255, b: 255 } })`
- `src/app/api/scrape-product-page/route.ts` : Retrait des paramètres `bg=white` qui causaient des erreurs

### 2. ✅ Classification des Images Améliorée

**Problème** : Pack shots sur fond noir classés en "lifestyle" au lieu de "product".

**Cause** : Le prompt IA était trop restrictif (uniquement fond blanc pour "product").

**Solution** : Prompt amélioré pour accepter les fonds unis (blanc, noir, gris, couleur) comme pack shots.

**Nouvelles règles de classification** :
- **Product** : Produit complet sur fond UNI (blanc/noir/gris/couleur)
- **Lifestyle** : Photo avec environnement RÉEL (salon, meubles, décor)
- **Other** : Détails/zooms sur une partie du produit
- **Unwanted** : Autre produit, logo seul, non pertinent

**Fichier modifié** :
- `src/app/api/classify-images/route.ts` : Prompt amélioré avec exemples clairs

## 🔍 Logs à Surveiller

Lors du prochain fetch d'images, vous verrez :

```
📊 [Download Images] Format source: png, Canaux: 4, Alpha: true
🎨 [Download Images] PNG transparent détecté → Conversion en JPG avec fond blanc
✅ [Download Images] Image 1 uploadée
```

## 📊 Tests Recommandés

1. **Test PNG Transparent** :
   - Fetch d'un produit avec PNG transparent (ex: Sonos Sub Mini)
   - Vérifier que les images ont un fond blanc

2. **Test Classification** :
   - Vérifier que les pack shots sur fond noir sont en "Produit"
   - Vérifier que les vraies lifestyle sont en "Situation"

## 📦 Dépendances

- `sharp@0.34.4` : Installé et fonctionnel ✅

## 🚀 Déploiement

Aucune modification de schéma BDD requise.
Prêt pour production immédiate.

