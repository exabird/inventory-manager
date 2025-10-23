# 📦 Versions des Features - Inventory Manager

Ce document liste toutes les features de l'application avec leurs versions respectives.

---

## 🔍 Scanner v1.0

**Date de release** : Janvier 2025  
**Version app** : v0.1.27  
**Statut** : ✅ Stable

### Caractéristiques

- **Zone rectangulaire visible** : Rectangle vert 280x180px pour guider le placement
- **Flash automatique** : S'active automatiquement 1 seconde après l'ouverture
- **Bip sonore** : Confirmation audio immédiate lors de la détection
- **FPS optimisé** : 10 FPS pour analyse approfondie de chaque frame
- **Résolution 4K** : Utilisation de la résolution maximale disponible (3840x2160)
- **API native** : Utilisation de l'API de détection native du navigateur si disponible
- **Sélection caméra iPhone** : Détection et sélection automatique de la caméra ultra grand-angle arrière
- **Formats supportés** : QR Code, Code 128, Code 39, Code 93, EAN-8, EAN-13, UPC-A, UPC-E, ITF

### Points forts

✅ Guidage visuel clair  
✅ Feedback audio immédiat  
✅ Flash automatique (pas besoin de cliquer)  
✅ Portée optimale : 15-30cm  
✅ Stable et fiable  

### Composants

- `src/components/scanner/BarcodeScanner.tsx`

---

## 🤖 Remplissage IA v1.0

**Date de release** : Janvier 2025  
**Version app** : v0.1.30  
**Statut** : ✅ Stable

### Description

Fonctionnalité complète de détection et de remplissage automatique des informations produit via des services externes et l'IA Claude.

### Composée de 2 fonctions indépendantes

#### Fonction 1 : Remplissage Automatique (Scan Code-Barres)

**Déclencheur** : ⚡ Automatique lors du scan de code-barres  
**API** : Barcode Lookup  

**Caractéristiques** :
- Appel automatique après détection du code-barres
- Rempli les champs de base : nom, marque, fabricant, description courte, catégorie
- **UNIQUEMENT si les champs sont vides** (ne jamais écraser les données existantes)
- Pas de cache pour garantir des données fraîches
- Gratuit (100 requêtes/jour)

#### Fonction 2 : Remplissage IA Avancé (Bouton 🤖)

**Déclencheur** : 🖱️ Clic sur bouton "Remplir avec IA"  
**API** : Anthropic Claude 3.5 Sonnet  

**Caractéristiques** :
- Bouton avec gradient violet-rose dans la section "Informations de base"
- Claude recherche automatiquement sur le site officiel de la marque
- Extraction complète des informations : spécifications techniques, prix, garantie, etc.
- Les champs remplis par l'IA sont marqués avec une **icône robot 🤖 bleue**
- Indicateur de chargement "Analyse IA..." pendant le traitement
- Pas de cache pour garantir des données à jour
- Coût : ~0.01€/produit (pay-as-you-go)

**Champs remplis par l'IA** :
- ✅ Nom complet du produit
- ✅ Marque
- ✅ Fabricant
- ✅ Référence fabricant exacte
- ✅ Description courte
- ✅ Description longue (notes)
- ✅ Prix de vente HTVA
- ✅ Période de garantie
- ✅ Catégorie
- ✅ Spécifications techniques (metadata)

### Composants

- `src/components/inventory/ProductInspector.tsx` (UI + logique)
- `src/lib/productDetectionService.ts` (Fonction 1 - Barcode Lookup)
- `src/app/api/ai-fill/route.ts` (Fonction 2 - Claude API)
- `src/components/ui/AIFieldIndicator.tsx` (Indicateur visuel robot)

### Configuration requise

Voir `docs/API_KEYS_SETUP.md` pour la configuration des clés API.

---

## 📊 Prochaines Features

### Scanner v2.0 (Planifié)
- [ ] Support multi-codes (scan de plusieurs codes en une fois)
- [ ] Zoom digital
- [ ] Mode batch (scan continu)
- [ ] Historique des scans de la session

### Autres features à versionner
- Gestion des stocks
- Système d'inventaire
- Rapports et analytics
- Paramètres
- etc.

---

## 📝 Convention de nommage

**Format** : `[Nom Feature] v[MAJOR].[MINOR]`

- **MAJOR** : Changements majeurs, refonte complète
- **MINOR** : Améliorations significatives, nouvelles sous-fonctionnalités

**Exemples** :
- Scanner v1.0 → Scanner v1.1 (ajout zoom)
- Scanner v1.1 → Scanner v2.0 (refonte complète avec ML)

---

*Dernière mise à jour : Janvier 2025*

