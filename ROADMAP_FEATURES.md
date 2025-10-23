# 🗺️ ROADMAP DES FEATURES - INVENTORY MANAGER

## Date : 23 Octobre 2025

---

## 📌 FEATURES EN ATTENTE

### 🏢 Système de mini-DBs pour métadonnées (BACKLOG)

**Concept :** Mini bases de données réutilisables pour éléments répétitifs

**Applicable à :**
- ✅ **Marques** (avec logos optionnels)
- ✅ **Fournisseurs** (sans logo)
- ✅ **Catégories** (déjà partiellement fait)
- ✅ **Emplacements de stockage**
- ✅ **Conditions** (neuf, occasion, reconditionné)
- ✅ Tout autre champ répétitif

**Principe :**
- Table dédiée pour chaque type de données
- Combobox avec autocomplétion
- Ajout rapide depuis le dropdown
- **Simple et léger**

**Implémentation :**
- Phase 1 : Table générique `metadata_values`
- Phase 2 : Combobox réutilisable
- Phase 3 : Intégration dans ProductInspector

**Status :** 📋 En attente de validation et idées complémentaires

---

## 🎯 FEATURES EN COURS

### 📷 Scanner de codes-barres (PRIORITÉ 1)

**Status :** 🔴 Non fonctionnel - À corriger maintenant

**Actions :**
- Vérifier l'implémentation actuelle
- Corriger les problèmes
- Utiliser html5-qrcode (déjà installé)

---

## ✅ FEATURES COMPLÉTÉES

### 📋 Table de produits moderne (TERMINÉ)
- Design Shadcn sobre
- Colonnes dynamiques
- Filtres avancés
- Tri par colonnes

### 🔧 Debugging complet (TERMINÉ)
- Documentation exhaustive
- Outils de monitoring
- Tests automatiques

---

**📝 Ce fichier sera mis à jour au fur et à mesure du développement**

