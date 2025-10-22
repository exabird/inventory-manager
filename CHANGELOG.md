# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

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
