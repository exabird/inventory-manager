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

