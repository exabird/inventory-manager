# 🤖 Flux Complet du Fetch IA

## 📋 Vue d'Ensemble

Le système de fetch IA permet de remplir automatiquement les informations d'un produit en utilisant l'intelligence artificielle Claude.

## 🎯 Modes Disponibles

### 1. **Métadonnées uniquement**
Remplit uniquement les champs vides du produit (marque, description, prix, etc.)

### 2. **Images uniquement**  
Télécharge et classe les images du produit

### 3. **Métadonnées + Images**
Effectue les deux opérations séquentiellement

---

## 🔄 Étapes Détaillées

### Mode "Métadonnées"

#### Étape 1 : Recherche métadonnées
- **API** : `/api/ai-fill` (productData)
- **Durée** : ~5-10 secondes
- **Process** :
  1. Claude recherche le produit en ligne
  2. Extrait les informations (marque, description, prix, garantie, etc.)
  3. Retourne un JSON structuré
- **Résultat** : Champs vides remplis automatiquement

---

### Mode "Images"

#### Étape 1 : Recherche URL produit
- **Durée** : ~500ms (affichage UX)
- **Process** : 
  - Claude détermine l'URL du site officiel ou commercial
  - Priorise : site fabricant > coolblue.be > bol.com > mediamarkt.be > fnac.be > amazon.fr

#### Étape 2 : Scraping de la page
- **API** : `/api/scrape-product-page-advanced` (appelée par `/api/ai-fill`)
- **Durée** : ~300ms (affichage UX) + temps réel de scraping
- **Process** :
  1. Lancement de Puppeteer headless
  2. Navigation vers l'URL trouvée
  3. Attente du chargement JavaScript (5 secondes)
  4. Extraction des images avec filtres :
     - Taille minimum : **400px × 400px**
     - Exclusion : logos, icônes, badges, thumbnails
     - Limite : **25 images maximum**
     - Tri : Plus grandes images en premier
- **Résultat** : Liste d'URLs d'images haute qualité

#### Étape 3 : Téléchargement images
- **API** : `/api/download-images` (appelée par `/api/ai-fill`)
- **Durée** : Variable (dépend du nombre d'images et de leur taille)
- **Process** :
  1. Téléchargement de chaque image
  2. Upload vers Supabase Storage
  3. Création d'entrées dans `product_images`
  4. URLs Supabase publiques générées
- **Résultat** : Images stockées dans Supabase

#### Étape 4 : Classification IA
- **API** : `/api/classify-images`
- **Durée** : ~5-15 secondes (selon nombre d'images)
- **Process** :
  1. Claude analyse chaque image
  2. Classification en 3 catégories :
     - **product** : Photo détourée du produit
     - **situation** : Photo d'ambiance/lifestyle
     - **unwanted** : Logo, icône, badge → supprimé
  3. Suppression des images "unwanted"
- **Résultat** : Images triées et filtrées

#### Étape 5 : Image principale
- **Durée** : <1 seconde
- **Process** :
  1. Vérification si une image est déjà marquée "featured"
  2. Si non : Sélection automatique :
     - Priorité 1 : Première image type "product"
     - Priorité 2 : Première image disponible
  3. Mise à jour `is_featured = true`
- **Résultat** : Thumbnail du produit configuré

---

## 📊 Timeline Visuelle

### Mode "Métadonnées uniquement"
```
✨ Fetch en cours...
───────────────────
 ⏳ Recherche métadonnées
    (5-10 secondes)
    
 ✓  Recherche métadonnées

✓ Résumé:
• 5 métadonnées
```

### Mode "Images uniquement"
```
✨ Fetch en cours...
───────────────────
 ✓  Recherche URL produit
 ✓  Scraping page
 ⏳ Téléchargement images
    (variable selon nombre)
 ○  Classification IA
 ○  Image principale

    ↓ ↓ ↓
    
 ✓  Recherche URL produit
 ✓  Scraping page
 ✓  Téléchargement images
 ⏳ Classification IA
    (5-15 secondes)
 ○  Image principale

    ↓ ↓ ↓
    
 ✓  Recherche URL produit
 ✓  Scraping page
 ✓  Téléchargement images
 ✓  Classification IA
 ⏳ Image principale
    (<1 seconde)

✓ Résumé:
• 12 images
```

### Mode "Métadonnées + Images"
```
✨ Fetch en cours...
───────────────────
 ⏳ Recherche métadonnées
 ○  Recherche URL produit
 ○  Scraping page
 ○  Téléchargement images
 ○  Classification IA
 ○  Image principale

    ↓ Progression séquentielle ↓
    
 ✓  Recherche métadonnées
 ✓  Recherche URL produit
 ✓  Scraping page
 ✓  Téléchargement images
 ✓  Classification IA
 ✓  Image principale

✓ Résumé:
• 5 métadonnées
• 12 images
```

---

## ⏱️ Durées Estimées

| Mode | Durée Totale | Détail |
|------|-------------|---------|
| **Métadonnées** | 5-10 sec | API Claude uniquement |
| **Images** | 20-40 sec | Scraping + Download + Classification |
| **Tout** | 25-50 sec | Métadonnées + Images séquentiel |

**Facteurs influençant la durée :**
- Complexité du produit
- Nombre d'images trouvées (limité à 25)
- Vitesse du site scrapé
- Charge de l'API Claude

---

## 🎨 États Visuels

### Icônes de la Timeline

| Icône | État | Description |
|-------|------|-------------|
| ✓ | **Complété** | Étape terminée avec succès |
| ⏳ | **En cours** | Étape en train de s'exécuter |
| ❌ | **Erreur** | Étape échouée |
| ○ | **En attente** | Étape pas encore démarrée |

### Couleurs

| Couleur | Usage |
|---------|-------|
| 🟢 **Vert** | Étape complétée |
| 🟣 **Violet** | Étape en cours |
| 🔴 **Rouge** | Erreur |
| ⚪ **Gris** | En attente |

---

## 🔍 Persistance du Résumé

**Après un fetch terminé :**
- ✅ Le résumé reste accessible en passant la souris sur le bouton IA
- ✅ Les compteurs (métadonnées, images) restent visibles
- ✅ Pas de timeout → le résultat est toujours consultable
- ✅ Un nouveau fetch remplace l'ancien résumé

---

## ❌ Gestion d'Erreur

En cas d'erreur, la timeline affiche :

```
✨ Erreur
───────────────────
 ✓  Recherche métadonnées
 ✓  Recherche URL produit
 ❌ Scraping page
 ○  Téléchargement images
 ○  Classification IA
 ○  Image principale

❌ Erreur
Impossible de scraper la page: 404
```

**Étapes complétées avant l'erreur :** ✓ Vert  
**Étape qui a échoué :** ❌ Rouge  
**Étapes non exécutées :** ○ Gris  

---

## 🛠️ APIs Internes Utilisées

| API | Rôle | Technologie |
|-----|------|-------------|
| `/api/ai-fill` | Fetch métadonnées et orchestration images | Claude 4.5 Sonnet |
| `/api/scrape-product-page-advanced` | Extraction images depuis page web | Puppeteer + Chromium |
| `/api/download-images` | Téléchargement vers Supabase | Supabase Storage |
| `/api/classify-images` | Classification et filtrage | Claude 4.5 Sonnet |

---

## 📝 Logs de Debug

Tous les processus sont loggés dans la console avec emojis :

```javascript
🤖 [UnifiedAIFetch] Début fetch IA en mode: all
🔑 [UnifiedAIFetch] Clé API récupérée depuis les paramètres
📝 [UnifiedAIFetch] Étape 1 : Remplissage métadonnées...
✅ [UnifiedAIFetch] Métadonnées récupérées: {...}
✅ [UnifiedAIFetch] 5 champ(s) rempli(s)
📸 [UnifiedAIFetch] Étape 2 : Récupération images...
✅ [UnifiedAIFetch] Images récupérées: 18
🎨 [UnifiedAIFetch] Classification de 18 images...
✅ [UnifiedAIFetch] Classification terminée
🗑️ [UnifiedAIFetch] Image unwanted supprimée: 3
✅ [UnifiedAIFetch] 15 image(s) traitée(s)
✅ [UnifiedAIFetch] Fetch IA terminé avec succès
```

---

## 🎯 Bonnes Pratiques

### Pour de Meilleurs Résultats :

1. **Nom du produit précis** : "iPhone 15 Pro 256GB Titanium" plutôt que "Téléphone"
2. **Marque renseignée** : Aide l'IA à cibler le bon site
3. **Code-barres EAN** : Identification exacte du produit
4. **Référence fabricant** : Meilleure précision

### Limites Actuelles :

- ✅ 25 images maximum par produit
- ✅ Taille minimum 400px pour filtrer les icônes
- ✅ Timeout de 60 secondes pour le scraping
- ✅ Sites supportés : Fabricants + principaux e-commerce BE/FR/NL

---

**Version du document** : Compatible avec `inventory-app v0.1.39+`

