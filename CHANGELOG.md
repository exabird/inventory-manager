# Changelog

## [0.1.17] - 2024-12-19

### ✨ Améliorations majeures de la liste des produits

#### 🎨 Colonne Stock améliorée
- **Icône + valeur colorée** : Affichage compact avec icône Package et couleur selon la disponibilité
- **Couleurs intelligentes** :
  - 🟢 Vert : Stock normal (≥5 unités)
  - 🟠 Orange : Stock faible (1-4 unités) 
  - 🔴 Rouge : Rupture de stock (0 unité)
- **Design cohérent** : Même amélioration sur mobile et desktop

#### 🔍 Recherche améliorée
- **Recherche étendue** : Recherche dans tous les champs pertinents (nom, référence, marque, description, métadonnées)
- **Recherche intelligente** : Inclut les métadonnées personnalisées et les champs cachés
- **Performance optimisée** : Filtrage en temps réel sans latence

#### 📊 Gestion des colonnes optimisée
- **Nouvelles colonnes** : Marque, Garantie, Stock minimum
- **Interface améliorée** : Modale des filtres réorganisée avec icônes et catégories
- **Colonnes par défaut** : Configuration intelligente (marque visible, prix achat masqué)
- **Métadonnées dynamiques** : Ajout facile de colonnes personnalisées

#### 🎯 Filtres et tri améliorés
- **Modale réorganisée** : Sections claires avec icônes (Colonnes principales, Champs de base, Métadonnées)
- **Recherche dans les colonnes** : Filtrage rapide des champs disponibles
- **Tri étendu** : Support des nouvelles colonnes
- **Interface intuitive** : Hover effects et feedback visuel améliorés

#### 📱 Responsive design
- **Mobile optimisé** : Affichage cohérent des améliorations sur mobile
- **Desktop perfectionné** : Tableau plus informatif et visuellement attrayant
- **Performance** : Chargement rapide et interactions fluides

### 🐛 Corrections
- Correction de l'affichage des colonnes dynamiques
- Amélioration de la gestion des états de chargement
- Optimisation des performances de filtrage

### 🔧 Améliorations techniques
- Code plus maintenable avec interfaces TypeScript étendues
- Gestion d'erreur améliorée avec fallback vers données simulées
- Architecture modulaire pour les composants de colonnes

---

## [0.1.16] - 2025-01-22

### 🎛️ Améliorations Tableau Produits
**Nouvelles fonctionnalités pour une meilleure gestion des données produit**

#### Interface améliorée :
- ✅ **Suppression du compteur "21 produits"** : Plus de texte redondant dans le header
- ✅ **Ligne de total** : Affichage des totaux à la fin du tableau (quantité, prix)
- ✅ **Configuration des colonnes** : Bouton Settings pour choisir les colonnes visibles
- ✅ **Colonnes configurables** : Référence fabricant, Catégorie, Stock, Prix vente, Prix achat

#### Fonctionnalités avancées :
- ✅ **Visibilité dynamique** : Les colonnes s'adaptent selon la configuration
- ✅ **Totaux calculés** : Somme automatique des quantités et prix
- ✅ **Interface intuitive** : Modale de configuration avec checkboxes
- ✅ **Persistance** : Les préférences de colonnes sont conservées

#### Améliorations techniques :
- ✅ **Composant modulaire** : `CompactProductListItem` avec props `columnVisibility`
- ✅ **État local** : Gestion de la visibilité des colonnes dans `CompactProductList`
- ✅ **Calculs optimisés** : Totaux calculés en temps réel
- ✅ **UX cohérente** : Design uniforme avec le reste de l'application

## [0.1.15] - 2025-01-22

### 🎨 Refonte UI/UX : Page Produits Épurée
**Simplification majeure de l'interface pour une expérience utilisateur optimale**

#### Nettoyage de l'interface :
- ✅ **Suppression des KPIs** : Déplacés vers le dashboard dédié
- ✅ **Suppression du branding** : Logo + nom + version déplacés dans le sidebar
- ✅ **Suppression des marges** : Plus de conteneurs inutiles autour de la liste
- ✅ **Suppression du fond gris** : Interface plus épurée et moderne

#### Focus sur l'essentiel :
- ✅ **Liste de produits uniquement** : Interface focalisée sur le contenu principal
- ✅ **Filtres sticky** : Seuls les filtres restent visibles lors du scroll
- ✅ **Plus de scroll horizontal** : Problème définitivement résolu sur mobile
- ✅ **Layout mobile optimisé** : Adaptation parfaite aux écrans mobiles

#### Améliorations techniques :
- ✅ **Code simplifié** : Suppression des variables d'état inutiles
- ✅ **Performance améliorée** : Moins de calculs et de rendus
- ✅ **Maintenance facilitée** : Code plus propre et organisé

## [0.1.14] - 2025-01-22

### 🤖 Nouvelle Feature Majeure : Scraping IA et Navigation
**Intégration de l'analyse IA avec Claude 3.5 Sonnet pour le scraping automatique de données produit**

#### Navigation améliorée :
- ✅ **Sidebar desktop** : Barre latérale toujours visible avec menu de navigation
- ✅ **Bottom bar mobile** : Navigation style app native en bas de l'écran
- ✅ **Pages nouvelles** : Dashboard et Paramètres

#### Scraping IA avec Claude :
- ✅ **Service de scraping** : Recherche automatique sur sites fabricants
- ✅ **API Claude 3.5 Sonnet** : Analyse intelligente des données produit
- ✅ **Préprompt personnalisable** : Configuration flexible du comportement IA
- ✅ **Validation cohérence** : Vérification logique des données extraites
- ✅ **Multi-sources** : OpenFoodFacts, UPC Database, sites fabricants

#### Indicateurs visuels IA :
- ✅ **Icônes colorées** : Badge sur champs remplis par l'IA
- ✅ **Score de confiance** : Vert (85%+), Jaune (70-85%), Orange (<70%)
- ✅ **Tooltip informatif** : Indique source et confiance au survol

#### Page Paramètres :
- ✅ **Configuration API** : Saisie clé API Claude
- ✅ **Sélection modèle** : Sonnet, Haiku, Opus
- ✅ **Confiance minimale** : Seuil configurable
- ✅ **Préprompt custom** : Édition et réinitialisation du prompt système

---

## [0.1.13] - 2025-01-22

### 🎨 Refonte complète du wizard de stock - Design system Shadcn
**Amélioration majeure de l'interface utilisateur du wizard de gestion de stock**

#### Interface de saisie de quantité optimisée :
- ✅ **Boutons +/- rapprochés** : Gap réduit à 2px pour une interface plus compacte
- ✅ **Bouton - gris** : `variant="secondary"` au lieu de rouge destructif
- ✅ **Valeur par défaut 1** : Initialisation à 1 au lieu de 0 (plus logique)
- ✅ **Limite 999** : Validation côté client et serveur
- ✅ **Saisie directe** : Champ se vide au focus pour éviter la concaténation
- ✅ **Pas de sélection bleue** : `userSelect: 'none'` + `caretColor: 'transparent'`
- ✅ **Pas de flèches** : Suppression des spinners avec CSS `appearance-none`

#### Interface épurée et moderne :
- ✅ **Suppression des Cards** : Design fluide sans containers inutiles
- ✅ **Suppression des raccourcis** : Interface focalisée sur l'essentiel
- ✅ **Bouton notes discret** : `variant="ghost"` avec hover noir
- ✅ **Navigation cohérente** : Boutons "Précédent" centrés et discrets sur toutes les étapes
- ✅ **Design system respecté** : Utilisation des variables CSS Shadcn (primary, secondary, muted)

#### Composants Shadcn/Radix UI :
- ✅ **Tous les boutons** : Composant Shadcn Button au lieu de balises HTML natives
- ✅ **Input de quantité** : Composant Shadcn Input avec toutes les props
- ✅ **Textarea notes** : Composant Shadcn Textarea
- ✅ **Labels** : Composant Shadcn Label pour l'accessibilité
- ✅ **Design system cohérent** : Toute l'interface utilise les composants Shadcn

#### Raccourcis et boutons :
- ✅ **Raccourcis bleus** : Composants Button 1, 5, 10, 25, 50 en dégradé bleu
- ✅ **Bouton Continuer** : Composant Button en dégradé bleu-violet
- ✅ **Bouton Ajouter note** : Composant Button variant outline avec bordure pointillée
- ✅ **États désactivés** : Bouton - gris quand quantité = 0

#### Interface optimisée :
- **Mobile-first** : Parfaitement adapté au tactile avec grands boutons
- **Effets visuels** : Ombres portées, dégradés, animations
- **Design moderne** : Couleurs vives et dégradés au lieu de gris basique
- **Responsive** : Adaptation automatique mobile/desktop
- **Alignement parfait** : Valeur centrée verticalement entre les boutons

#### Résultat :
- ⚡ Saisie ultra-rapide avec les raccourcis
- 👆 Expérience tactile optimale sur mobile
- 🎯 Moins d'erreurs grâce aux contrôles visuels
- 🚀 Workflow accéléré pour les opérations courantes
- 🎨 Design system professionnel avec Shadcn/Radix UI
- 👁️ Valeur numérique claire sans bordure distrayante
- ⚖️ Équilibre visuel parfait avec boutons D/D inversé

### 📚 Documentation :
- ✅ Guide de test mis à jour (`STOCK_WIZARD_UX_FIX_GUIDE.md`)
- ✅ Nouveaux tests pour l'interface de quantité
- ✅ Checklist de validation étendue
- ✅ Version mise à jour : 0.1.13

---

## [0.1.12] - 2024-12-19

### 🎯 Nouvelle fonctionnalité majeure : Gestion de Stock Complète

**Système complet de gestion de stock avec historique et traçabilité**

#### Architecture de base de données :
- ✅ **Table stock_operations** : Historique complet de toutes les modifications
- ✅ **Table stock_reasons** : 18 raisons prédéfinies pour les opérations (ajouts, retraits, ajustements)
- ✅ **Colonnes ajoutées** : min_stock_required, min_stock_quantity dans products

#### Services TypeScript :
- ✅ **StockService complet** : Gestion centralisée des opérations de stock
- ✅ **Méthodes disponibles** :
  - addStock() : Ajouter du stock avec raison
  - removeStock() : Retirer du stock avec raison
  - updateQuantity() : Modifier directement la quantité
  - getOperationsByProduct() : Récupérer l'historique
  - updateMinStockSettings() : Configurer les alertes

#### Interface utilisateur :
- ✅ **Onglet Stock** : Interface complète dans le ProductInspector
- ✅ **Modification directe** : Champ numérique avec validation en temps réel
- ✅ **Boutons d'action rapide** : Ajouter / Retirer / Définir
- ✅ **Modals contextuels** : Formulaires avec raison et notes
- ✅ **Stock minimum** : Toggle et configuration des alertes
- ✅ **Badge d'alerte** : "Stock bas" quand stock ≤ minimum

#### Historique complet :
- ✅ **Log chronologique** : Toutes les modifications de la plus récente à la plus ancienne
- ✅ **Informations détaillées** :
  - Type d'opération (icônes colorées : vert/rouge/bleu)
  - Quantité avant → après
  - Raison sélectionnée
  - Notes supplémentaires
  - Date et heure précises
  - Utilisateur (préparé pour future implémentation)

#### Raisons prédéfinies PME :
**Ajouts de stock :**
- Réception commande (livraison fournisseur)
- Retour client
- Correction inventaire
- Réparation terminée
- Stock promotionnel

**Retraits de stock :**
- Intervention client (sortie sur site)
- Vente directe
- Casse/Défaut
- Expédition client
- Envoi réparation
- Usage interne
- Correction inventaire

**Ajustements :**
- Erreur de comptage
- Réconciliation
- Transfert

**Définition directe :**
- Inventaire complet
- Initialisation

#### Fonctionnalités avancées :
- ✅ **Validation en temps réel** : Empêche les quantités négatives
- ✅ **Messages d'erreur clairs** : Gestion complète des erreurs
- ✅ **Logs détaillés** : Console logs pour le débogage (🔄, ✅, ❌)
- ✅ **Synchronisation** : Mise à jour automatique du header et de la liste
- ✅ **Performance optimisée** : Chargement rapide de l'historique

#### Documentation :
- ✅ **Guide de test complet** : STOCK_TESTING_GUIDE.md avec 10 scénarios de test
- ✅ **Checklist de validation** : Tous les cas d'usage couverts

### 🔧 Corrections
- **StockService.updateQuantity** : Correction du calcul de quantity_change pour l'opération 'set'
- **handleOperationSuccess** : Récupération correcte de la quantité après une opération
- **Gestion des erreurs** : Messages d'erreur plus explicites dans les modals

### 📦 Nouveaux composants
- **StockTab.tsx** : Composant principal pour l'onglet de gestion de stock
- **StockOperationModal** : Modal pour les opérations (add/remove/set)
- **Switch.tsx** : Composant toggle pour les paramètres
- **StockService.ts** : Service centralisé pour les opérations de stock

### 🎨 Améliorations UX
- Interface simple et intuitive adaptée aux PME
- Icônes colorées pour identifier rapidement les types d'opérations
- Badges visuels pour les alertes de stock
- Formulaires avec validation en temps réel
- Notes optionnelles pour contexte supplémentaire

## [0.1.11] - 2024-12-19

### 🔧 Corrections
- **Correction duplication scanner** : Résolution du problème d'affichage en double du scanner de code-barres
- **ID unique scanner** : Génération d'ID unique pour éviter les conflits entre instances
- **Nettoyage automatique** : Ajout du nettoyage automatique du scanner au démontage du composant
- **Modal optimisée** : Amélioration du z-index et du positionnement de la modal scanner

### 🎯 Améliorations
- **Champ SKU modifiable** : Le champ code-barres est maintenant modifiable même sur produits existants
- **Icône scanner intégrée** : Bouton scanner compact à côté du champ SKU
- **Détection automatique** : Service de détection automatique des infos produit basé sur le code-barres
- **Interface améliorée** : Meilleure UX pour le scan et la modification des codes-barres

## [0.1.10] - 2024-12-19

### 🎯 Nouvelle fonctionnalité : Système de statut des champs
**Identification visuelle des champs fonctionnels vs non fonctionnels**

#### Nouvelle fonctionnalité :
- **Système de statut** : Marquage visuel des champs selon leur état fonctionnel
- **Composants fonctionnels** : FunctionalInput, FunctionalTextarea, FunctionalSelect
- **Configuration centralisée** : Statut de chaque champ défini dans fieldStatus.ts
- **Indicateurs visuels** : Badges et couleurs pour distinguer les champs

#### Fonctionnalités ajoutées :
- ✅ **Badges de statut** : "Fonctionnel" (vert) vs "En développement" (bleu)
- ✅ **Couleurs distinctives** : Champs non fonctionnels en bleu
- ✅ **Messages explicatifs** : Raison du statut non fonctionnel
- ✅ **Configuration flexible** : Facilement modifiable pour chaque champ
- ✅ **Composants réutilisables** : FunctionalInput, FunctionalTextarea, FunctionalSelect

#### Champs marqués comme fonctionnels :
- ✅ Nom du produit, Référence interne, Quantité
- ✅ Code-barres, Fabricant, Catégorie
- ✅ Marque, Référence fabricant, Description courte
- ✅ Prix d'achat HTVA, Prix de vente HTVA

#### Champs marqués comme non fonctionnels :
- 🔵 Métadonnées JSON (supplier, location, weight, etc.)
- 🔵 Champs complexes (price_history, stock_history, etc.)
- 🔵 Champs externes (website, external_links, etc.)

#### Avantages :
- **Transparence** : L'utilisateur sait quels champs fonctionnent
- **Évite la confusion** : Plus de frustration avec les champs non sauvegardés
- **Planification** : Facilite la priorisation des développements
- **UX améliorée** : Interface plus claire et informative

---

### 🎯 Nouvelle fonctionnalité majeure : Système de statut des champs
**Identification visuelle des champs fonctionnels vs non fonctionnels**

#### Nouvelle fonctionnalité :
- **Système de statut** : Marquage visuel des champs selon leur état fonctionnel
- **Composants fonctionnels** : FunctionalInput, FunctionalTextarea, FunctionalSelect
- **Configuration centralisée** : Statut de chaque champ défini dans fieldStatus.ts
- **Indicateurs visuels** : Badges et couleurs pour distinguer les champs

#### Fonctionnalités ajoutées :
- ✅ **Badges de statut** : "Fonctionnel" (vert) vs "En développement" (bleu)
- ✅ **Couleurs distinctives** : Champs non fonctionnels en bleu
- ✅ **Messages explicatifs** : Raison du statut non fonctionnel
- ✅ **Configuration flexible** : Facilement modifiable pour chaque champ
- ✅ **Composants réutilisables** : FunctionalInput, FunctionalTextarea, FunctionalSelect

#### Champs marqués comme fonctionnels :
- ✅ Nom du produit, Référence interne, Quantité
- ✅ Code-barres, Fabricant, Catégorie
- ✅ Marque, Référence fabricant, Description courte
- ✅ Prix d'achat HTVA, Prix de vente HTVA

#### Champs marqués comme non fonctionnels :
- 🔵 Métadonnées JSON (supplier, location, weight, etc.)
- 🔵 Champs complexes (price_history, stock_history, etc.)
- 🔵 Champs externes (website, external_links, etc.)

#### Avantages :
- **Transparence** : L'utilisateur sait quels champs fonctionnent
- **Évite la confusion** : Plus de frustration avec les champs non sauvegardés
- **Planification** : Facilite la priorisation des développements
- **UX améliorée** : Interface plus claire et informative

---

### 🎨 Amélioration : Header ProductInspector informatif
**Affichage des informations produit dans le header au lieu du texte générique**

#### Améliorations apportées :
- **Nom du produit** : Affiché comme titre principal dans le header
- **Référence fabricant** : Affichée en petit sous le nom (si disponible)
- **Badge de statut** : "En stock", "Stock faible" ou "Rupture" avec couleurs appropriées
- **Quantité** : Nombre d'unités affiché à côté du badge
- **Miniature** : Image featured du produit conservée

#### Informations affichées :
- ✅ **Titre** : Nom du produit (ex: "Pix9")
- ✅ **Référence** : "Ref: [manufacturer_ref]" en petit
- ✅ **Badge statut** : Couleur dynamique selon la quantité
- ✅ **Quantité** : "[X] unités" avec police semi-bold
- ✅ **Miniature** : Image featured du produit

#### Logique des badges :
- 🔴 **Rupture** : Quantité = 0 (badge rouge)
- 🟡 **Stock faible** : Quantité < 5 (badge gris)
- 🟢 **En stock** : Quantité ≥ 5 (badge vert)

#### Résultat :
- ✅ Header plus informatif et utile
- ✅ Identification rapide du produit
- ✅ Statut de stock visible immédiatement
- ✅ Interface plus professionnelle

---

### 🔧 Correction : Colonnes manquantes dans la base de données
**Résolution de l'erreur "Could not find the 'brand' column"**

#### Corrections apportées :
- **Colonnes manquantes** : Ajout de `brand`, `manufacturer_ref`, `short_description`, `selling_price_htva`, `purchase_price_htva`
- **Schéma synchronisé** : Base de données alignée avec le code TypeScript
- **Migration appliquée** : Toutes les colonnes nécessaires créées
- **Erreur résolue** : Plus d'erreur lors du changement d'image featured

#### Colonnes ajoutées :
- ✅ `brand` (TEXT) : Marque du produit
- ✅ `manufacturer_ref` (TEXT) : Référence fabricant
- ✅ `short_description` (TEXT) : Description courte
- ✅ `selling_price_htva` (DECIMAL) : Prix de vente HTVA
- ✅ `purchase_price_htva` (DECIMAL) : Prix d'achat HTVA

#### Résultat :
- ✅ Changement d'image featured fonctionnel
- ✅ Sauvegarde des données étendues possible
- ✅ Interface ProductInspector entièrement fonctionnelle
- ✅ Plus d'erreurs de schéma

---

### 🎨 Refonte UI/UX : Format carré et intégration ShadCN
**Optimisation complète de l'interface avec composants ShadCN et format carré**

#### Corrections apportées :
- **Éléments dark mode** : Suppression des styles dark mode inappropriés
- **Miniatures optimisées** : Taille plus grande et meilleure intégration
- **Composants ShadCN** : Utilisation des composants Card, Badge, Button existants
- **Format carré** : Images et zone d'upload en format carré uniforme

#### Nouvelles fonctionnalités :
- ✅ **Scroll horizontal** : Images sur une seule ligne avec défilement
- ✅ **Format carré uniforme** : Toutes les images et zone d'upload en 24x24
- ✅ **Zone d'upload intégrée** : Même format que les images dans le scroll
- ✅ **Drag & Drop amélioré** : Réorganisation avec feedback visuel
- ✅ **Interface compacte** : Moins d'espace vertical utilisé
- ✅ **Composants ShadCN** : Design system cohérent

#### Améliorations UX :
- Interface plus moderne avec Card components
- Miniatures plus grandes et mieux intégrées
- Actions au survol plus intuitives
- Scroll automatique vers les nouvelles images
- Indicateurs visuels améliorés

#### Composants créés :
- `ImageUploaderSquare.tsx` : Version carrée avec scroll horizontal
- `ProductListItem.tsx` : Refactorisé avec ShadCN components

---

### 🎨 Amélioration majeure : UI/UX et miniatures
**Refonte complète de l'interface d'upload et intégration des miniatures**

#### Corrections apportées :
- **Erreur console** : Correction de l'affichage des erreurs dans ProductService
- **ImageUploader compact** : Nouveau composant avec interface optimisée
- **Drag & Drop** : Réorganisation des images par glisser-déposer
- **Miniatures intégrées** : Affichage dans listes, cards et header

#### Nouvelles fonctionnalités :
- ✅ **Interface compacte** : Upload d'images plus ergonomique
- ✅ **Drag & Drop réorganisation** : Ordre des images modifiable
- ✅ **Miniatures automatiques** : Chargement depuis la DB
- ✅ **Fallback intelligent** : Icônes par défaut si pas d'image
- ✅ **Header avec miniature** : ProductInspector avec image featured
- ✅ **Listes avec miniatures** : ProductListItem et ProductCard améliorés

#### Composants créés :
- `ImageUploaderCompact.tsx` : Version compacte avec drag & drop
- `ProductThumbnail.tsx` : Composant réutilisable pour miniatures
- Intégration dans `ProductInspector`, `ProductListItem`, `ProductCard`

#### Améliorations UX :
- Interface plus compacte et moderne
- Actions rapides (featured, suppression) au survol
- Indicateurs visuels pour l'image principale
- Chargement asynchrone avec états de loading

---

### 🔧 Correction : Erreur Runtime ReferenceError
**Résolution de l'erreur "dragOver is not defined"**

#### Corrections apportées :
- **Variables manquantes** : Ajout de `dragOver`, `setDragOver`, `isUploading`, `fileInputRef`
- **Fichiers obsolètes** : Suppression de `ProductInspectorOld.tsx` et `ProductInspectorV2.tsx`
- **Compilation TypeScript** : Erreurs de types résolues
- **Build réussi** : Application compile sans erreurs

#### Résultat :
- ✅ Erreur Runtime ReferenceError corrigée
- ✅ Compilation TypeScript réussie
- ✅ Build Next.js sans erreurs
- ✅ Application fonctionnelle

---

### 🔧 Correction majeure : Persistance des images
**Résolution du problème de perte d'images après refresh**

#### Corrections apportées :
- **Table product_images** : Nouvelle table pour stocker les métadonnées des images
- **Service ProductImageService** : Gestion complète des images avec CRUD
- **Intégration base de données** : Images sauvegardées et chargées depuis la DB
- **Système featured** : Gestion de l'image principale avec contraintes DB
- **Chargement automatique** : Images existantes chargées au montage du composant

#### Fonctionnalités ajoutées :
- ✅ **Persistance complète** : Images conservées après refresh
- ✅ **Chargement automatique** : Images existantes affichées au chargement
- ✅ **Gestion featured** : Une seule image principale par produit
- ✅ **Suppression propre** : Nettoyage Storage + DB
- ✅ **Logs détaillés** : Traçabilité complète des opérations

#### Changements techniques :
- Nouvelle table `product_images` avec contraintes et index
- Service `ProductImageService` avec méthodes CRUD complètes
- Politiques RLS pour accès public (développement)
- Intégration complète Storage + Database

---

### 🔧 Correction finale : Upload d'images fonctionnel
**Résolution complète du problème d'upload avec politiques RLS**

#### Corrections apportées :
- **Politiques RLS mises à jour** : Accès anonyme autorisé pour le développement
- **Test de connexion amélioré** : Utilisation d'un fichier PNG valide au lieu de texte
- **Composant de test retiré** : Interface nettoyée après validation
- **Configuration finale** : Bucket entièrement fonctionnel

#### Résultat :
- ✅ Bucket `product-images` accessible
- ✅ Upload d'images fonctionnel
- ✅ Politiques de sécurité configurées
- ✅ Interface utilisateur propre

---

### 🔧 Correction : Upload d'images Supabase Storage
**Résolution du problème d'upload d'images avec configuration complète**

#### Corrections apportées :
- **Bucket Supabase Storage** : Création du bucket `product-images` avec permissions RLS
- **Politiques de sécurité** : Configuration des politiques pour lecture publique et upload authentifié
- **Gestion d'erreurs améliorée** : Logs détaillés et messages d'erreur plus informatifs
- **Composant de test** : Ajout temporaire d'un composant StorageTest pour diagnostic

#### Configuration technique :
- Bucket `product-images` créé avec limite de 5MB
- Types MIME autorisés : JPEG, PNG, GIF, WebP
- Politiques RLS pour utilisateurs authentifiés
- Logs de debug pour traçabilité des uploads

#### Améliorations UX :
- Messages d'erreur plus clairs
- Gestion des erreurs par fichier (continue même si un échoue)
- Logs console pour diagnostic des problèmes

---

### 🔧 Amélioration majeure : Système d'onglets ProductInspector
**Interface utilisateur révolutionnée avec organisation par onglets**

#### Fonctionnalités ajoutées :
- **Système d'onglets** : 7 onglets organisés (Favoris, Stock, Fournisseur, Spécifications, Dates, Web, Analytics)
- **Section Favoris** : Données essentielles toujours visibles (images, nom, références, prix)
- **Upload d'images** : Gestion complète avec Supabase Storage et système d'image featured
- **Données étendues** : Support pour marque, référence fabricant, description courte, prix HTVA
- **Composant Tabs** : Système d'onglets réutilisable avec icônes et badges

#### Améliorations UX :
- **Navigation intuitive** : Onglets avec icônes contextuelles
- **Workflow optimisé** : Données essentielles dans l'onglet Favoris
- **Reprises intelligentes** : Données importantes reprises dans les onglets pertinents
- **Interface mobile** : Onglets adaptés aux petits écrans

#### Changements techniques :
- Nouveau composant `ImageUploader` avec gestion Supabase Storage
- Nouveau composant `Tabs` réutilisable
- Extension du modèle `ProductFormData` avec nouvelles propriétés
- Configuration Supabase Storage pour bucket `product-images`

---

### 🚀 NOUVELLE FEATURE COMPLÈTE : ProductInspector
**Système d'édition avancé des produits avec métadonnées complètes**

#### Fonctionnalités principales :
- **ProductInspector** : Sidebar d'édition complète et professionnelle
- **Métadonnées avancées** : Support pour prix d'achat/vente, fournisseur, emplacement, poids, dimensions, date d'expiration, SKU
- **Calcul automatique de marge** : Affichage de la marge bénéficiaire en pourcentage et en euros
- **Aperçu d'image** : Visualisation en temps réel des images de produits
- **Composant ClientOnly** : Protection contre les erreurs d'hydratation Next.js

### 🔧 Améliorations
- **Interface utilisateur** : Lignes de produits cliquables au lieu de boutons séparés
- **Expérience mobile** : Sidebar responsive avec overlay semi-transparent
- **Organisation des données** : Sections structurées (Informations de base, Stock et Prix, Logistiques, Médias)
- **Icônes contextuelles** : Icônes appropriées pour chaque section et champ
- **Badges de statut** : Indicateurs visuels dynamiques (rupture/stock faible/en stock)

### 🐛 Corrections
- **Erreurs d'hydratation** : Résolution des problèmes SSR/client avec les extensions Chrome
- **Configuration Next.js** : Optimisation des imports et gestion mémoire améliorée
- **Métadonnées** : Mise à jour du titre et langue de l'application (fr)
- **Composants modaux** : Encapsulation dans ClientOnly pour éviter les erreurs d'hydratation

### 📦 Changements techniques
- Suppression des boutons Edit/Delete des ProductListItem et ProductCard
- Remplacement du Dialog par ProductInspector dans page.tsx
- Ajout de vérifications d'hydratation pour les composants sensibles
- Optimisation de la configuration Next.js avec `optimizePackageImports`

---

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [0.0.23] - 2025-01-22

### 📋 Amélioration des processus
- **Processus de développement strict** : Nouveau workflow obligatoire avec validation utilisateur
- **Tests locaux complets** : Compilation, linting, types, serveur, navigateur, Supabase
- **Validation utilisateur obligatoire** : Attendre validation avant déploiement
- **Déploiement via MCP** : Push GitHub + vérification logs Vercel après 45s
- **Checklist détaillée** : Processus étape par étape pour éviter les erreurs

### 🛠️ Outils MCP documentés
- **MCP Supabase** : Logs API, Database, Auth, Storage, Edge Functions
- **MCP Vercel** : Logs déploiement, runtime, métriques, déploiements
- **MCP GitHub** : Push automatique, PR, Issues, Actions CI/CD

### 🎯 Impact
- **Qualité améliorée** : Moins d'erreurs en production grâce aux tests stricts
- **Processus reproductible** : Workflow standardisé pour tous les développements
- **Validation garantie** : Pas de déploiement sans validation utilisateur
- **Monitoring complet** : Vérification logs à tous les niveaux

---

## [0.0.22] - 2025-01-22

### 🎨 Améliorations UX
- **Nouveau composant ProductListItem** : Interface compacte et moderne inspirée des meilleures pratiques mobile-first
- **Filtres par statut de stock** : Tous, En stock, Stock faible, Rupture avec compteurs dynamiques
- **Basculement de vue** : Vue liste compacte et vue grille détaillée
- **Actions intégrées** : Contrôles de quantité et actions rapides directement dans la liste
- **Design moderne** : Utilisation de Shadcn/ui pour une interface cohérente et responsive

### 🎯 Impact
- **Interface mobile-first** : Optimisée pour l'utilisation sur smartphone
- **Navigation intuitive** : Filtres horizontaux et contrôles de vue accessibles
- **Efficacité améliorée** : Informations essentielles visibles d'un coup d'œil
- **Actions rapides** : Modification des quantités sans navigation supplémentaire

---

## [0.0.21] - 2025-01-22

### 🐛 Corrections
- **Correction contrainte NOT NULL** : Suppression de la contrainte NOT NULL sur la colonne `barcode` en base de données
- **Migration make_barcode_nullable** : Les produits peuvent maintenant être créés sans code-barres
- **Résolution erreur création** : Plus d'erreur `null value in column "barcode" violates not-null constraint`

### 🎯 Impact
- **Création de produits simplifiée** : Seuls nom + référence interne requis
- **Formulaire fonctionnel** : Plus de blocage lors de la création
- **Base de données flexible** : Support des produits sans code-barres

---

## [0.0.20] - 2025-01-22

### 🐛 Corrections
- **Correction contrainte NOT NULL** : Suppression de la contrainte NOT NULL sur la colonne `barcode` en base de données
- **Correction erreur UUID** : Résolution de l'erreur `invalid input syntax for type uuid` lors de la création de produits
- **Correction TypeScript** : Interface ProductFormData mise à jour pour gérer les valeurs `null`
- **Correction build Vercel** : Résolution des erreurs de compilation TypeScript
- **Correction gestion d'erreur** : Le formulaire ne se ferme plus en cas d'erreur, affichage des messages d'erreur visibles

### 🔧 Améliorations
- **Champs obligatoires modifiés** : Seuls "Référence interne" et "Nom du produit" sont maintenant obligatoires
- **Validation côté client** : Validation en temps réel avec bordures rouges et messages d'erreur
- **Nettoyage des données** : Conversion automatique des chaînes vides en `null` pour Supabase
- **Debug statistiques** : Ajout de logs pour diagnostiquer les différences entre produits totaux et visibles

### 📱 Interface
- **Messages de notification** : Affichage des erreurs et succès avec icônes
- **Validation visuelle** : Bordures rouges sur les champs invalides
- **Feedback utilisateur** : Messages contextuels pour chaque erreur

---

## [0.0.19] - 2025-01-22

### 🐛 Corrections
- **Correction useCallback** : Résolution du problème de chargement des produits avec `useCallback`
- **Correction ordre des déclarations** : Déplacement de `loadProducts` avant le `useEffect` qui l'utilise

### 🔧 Améliorations
- **Gestion d'erreur robuste** : Ajout de `try-catch` dans les fonctions de scan et sélection de codes
- **Sélection de codes améliorée** : Priorisation des codes UPC avec logs de debug
- **Gestion des erreurs client-side** : Prévention des écrans blancs après scan

---

## [0.0.18] - 2025-01-22

### 🐛 Corrections
- **Correction formulaire** : Simplification du ProductForm pour éviter les erreurs client-side
- **Suppression dépendances problématiques** : Retrait de `react-hook-form`, `zod`, et `Refine.dev`
- **Composants natifs** : Remplacement des composants Shadcn/ui par des éléments HTML natifs

### 🔧 Améliorations
- **Scanner amélioré** : Gestion des erreurs pour éviter les crashes
- **Sélection de caméra** : Logique améliorée pour éviter la caméra frontale par défaut

---

## [0.0.17] - 2025-01-22

### 🐛 Corrections
- **Correction sélection de caméra** : Exclusion explicite des caméras frontales
- **Gestion des erreurs** : Ajout de `try-catch` pour éviter les écrans blancs

### 🔧 Améliorations
- **Scanner multi-codes** : Détection et sélection automatique du meilleur code-barres
- **Interface de sélection** : Menu pour choisir manuellement la caméra

---

## [0.0.16] - 2025-01-22

### 🐛 Corrections
- **Correction sélection de caméra** : Priorisation de la caméra ultra grand angle arrière
- **Gestion iOS** : Messages d'erreur spécifiques pour Chrome sur iOS

### 🔧 Améliorations
- **Scanner amélioré** : Détection de multiples codes-barres/QR codes
- **Sélection intelligente** : Choix automatique du code UPC le plus approprié

---

## [0.0.15] - 2025-01-22

### 🚀 Nouvelles fonctionnalités
- **Déploiement Vercel** : Application déployée sur `https://stock.exabird.be/`
- **HTTPS** : Accès caméra fonctionnel sur iOS (Safari et Chrome)
- **Domaine personnalisé** : Configuration du domaine `stock.exabird.be`

### 🔧 Améliorations
- **Configuration réseau** : Ajout de `allowedDevOrigins` pour l'accès mobile local
- **Scanner mobile** : Optimisation pour l'utilisation sur smartphone

---

## [0.0.14] - 2025-01-22

### 🐛 Corrections
- **Correction clé API Supabase** : Mise à jour de la clé anonyme avec la valeur correcte
- **Test de connectivité** : Script de test pour vérifier la connexion Supabase

### 🔧 Améliorations
- **Logs de debug** : Ajout de logs détaillés dans ProductService
- **Diagnostic** : Scripts de test pour identifier les problèmes de connectivité

---

## [0.0.13] - 2025-01-22

### 🐛 Corrections
- **Correction sélection de codes** : Amélioration de la logique de priorisation UPC
- **Filtrage des codes** : Exclusion des numéros de série trop longs

### 🔧 Améliorations
- **Logs de debug** : Ajout de logs pour suivre la sélection des codes
- **Validation des codes** : Filtrage des codes non-standard

---

## [0.0.12] - 2025-01-22

### 🐛 Corrections
- **Correction erreurs client-side** : Résolution des exceptions dans le formulaire
- **Simplification** : Retrait des dépendances problématiques

### 🔧 Améliorations
- **Formulaire stable** : Utilisation d'éléments HTML natifs
- **Gestion d'état** : Simplification de la gestion des états du formulaire

---

## [0.0.11] - 2025-01-22

### 🐛 Corrections
- **Correction écran blanc** : Ajout de gestion d'erreur dans le scanner
- **Correction sélection de codes** : Gestion des erreurs lors de la sélection

### 🔧 Améliorations
- **Robustesse** : Ajout de `try-catch` dans les fonctions critiques
- **Feedback utilisateur** : Messages d'erreur plus informatifs

---

## [0.0.10] - 2025-01-22

### 🐛 Corrections
- **Correction clé Supabase** : Résolution du problème de clé API invalide
- **Correction chargement** : Résolution du problème de chargement des produits

### 🔧 Améliorations
- **Configuration Supabase** : Valeurs par défaut pour les clés API
- **Gestion d'erreur** : Amélioration de la gestion des erreurs de connexion

---

## [0.0.9] - 2025-01-22

### 🐛 Corrections
- **Correction build** : Résolution des erreurs de compilation TypeScript
- **Correction imports** : Mise à jour des chemins d'import

### 🔧 Améliorations
- **Configuration** : Mise à jour de `tsconfig.json` et `components.json`
- **Dépendances** : Nettoyage des dépendances inutilisées

---

## [0.0.8] - 2025-01-22

### 🐛 Corrections
- **Correction scanner** : Suppression des propriétés non supportées
- **Correction imports** : Retrait des imports inutilisés

### 🔧 Améliorations
- **Scanner** : Configuration simplifiée pour html5-qrcode
- **Performance** : Optimisation des imports

---

## [0.0.7] - 2025-01-22

### 🐛 Corrections
- **Correction déploiement** : Résolution des erreurs de variables d'environnement
- **Correction configuration** : Mise à jour des valeurs par défaut

### 🔧 Améliorations
- **Configuration Vercel** : Simplification de la configuration de déploiement
- **Variables d'environnement** : Valeurs par défaut pour le build

---

## [0.0.6] - 2025-01-22

### 🐛 Corrections
- **Correction authentification** : Résolution des problèmes d'authentification Vercel
- **Correction CLI** : Configuration du token Vercel

### 🔧 Améliorations
- **Déploiement** : Intégration GitHub pour les déploiements automatiques
- **Configuration** : Mise en place de l'intégration continue

---

## [0.0.5] - 2025-01-22

### 🐛 Corrections
- **Correction accès caméra iOS** : Messages d'erreur spécifiques pour Chrome
- **Correction HTTPS** : Explication des exigences HTTPS pour iOS

### 🔧 Améliorations
- **Scanner mobile** : Optimisation pour l'utilisation sur iOS
- **Fallback manuel** : Ajout d'un champ de saisie manuelle

---

## [0.0.4] - 2025-01-22

### 🐛 Corrections
- **Correction accès réseau** : Ajout de `allowedDevOrigins` pour l'accès mobile
- **Correction CORS** : Configuration pour l'accès depuis l'iPhone

### 🔧 Améliorations
- **Accès mobile** : Configuration pour l'accès depuis le réseau local
- **Développement** : Amélioration de l'expérience de développement mobile

---

## [0.0.3] - 2025-01-22

### 🐛 Corrections
- **Correction erreurs Next.js** : Résolution des erreurs de compilation
- **Correction configuration** : Mise à jour des fichiers de configuration

### 🔧 Améliorations
- **Monitoring** : Scripts de surveillance des logs
- **Qualité** : Configuration ESLint pour la détection d'erreurs

---

## [0.0.2] - 2025-01-22

### 🐛 Corrections
- **Correction configuration Supabase** : Mise à jour des clés API
- **Correction connexion** : Résolution des problèmes de connectivité

### 🔧 Améliorations
- **Base de données** : Création des tables et politiques RLS
- **Services** : Implémentation des services de base

---

## [0.0.1] - 2025-01-22

### 🚀 Première version
- **Structure de base** : Création du projet Next.js avec TypeScript
- **Interface** : Interface mobile-first avec Tailwind CSS
- **Scanner** : Intégration html5-qrcode pour le scan de codes-barres
- **Base de données** : Configuration Supabase avec tables de base
- **Déploiement** : Configuration GitHub et Vercel

### 📱 Fonctionnalités
- Scanner de codes-barres/QR codes
- Formulaire d'ajout de produits
- Liste des produits avec recherche
- Interface responsive mobile-first
- Gestion des catégories

---

## Roadmap

### Version 0.1.0 (Beta Stable) - Prévue
- ✅ Gestion complète des références produits
- ✅ Scanner fonctionnel sur mobile
- ✅ Interface stable et sans bugs majeurs
- ✅ Déploiement automatisé

### Version 0.2.0 - Prévue
- 🔄 Interface de gestion des pièces
- 🔄 Suivi des garanties
- 🔄 Numéros de série individuels

### Version 0.3.0 - Prévue
- 🔄 Intégration IA (Claude API)
- 🔄 Scraping automatique des métadonnées
- 🔄 Enrichissement des données produits

### Version 0.4.0 - Prévue
- 🔄 API externe (Open Food Facts, UPC Database)
- 🔄 Synchronisation des données
- 🔄 Import/Export de données

---

## Types de changements

- **Ajouté** : pour les nouvelles fonctionnalités
- **Modifié** : pour les changements de fonctionnalités existantes
- **Déprécié** : pour les fonctionnalités qui seront supprimées
- **Supprimé** : pour les fonctionnalités supprimées
- **Corrigé** : pour les corrections de bugs
- **Sécurité** : pour les vulnérabilités
