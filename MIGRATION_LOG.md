# Migration appliquée: make_barcode_nullable

## Problème résolu
- Erreur: 'null value in column barcode violates not-null constraint'
- Cause: Colonne barcode avait une contrainte NOT NULL
- Solution: Suppression de la contrainte NOT NULL

## Test effectué
- Création de produit avec barcode = null ✅
- Test réussi et nettoyé

## Résultat
- Les produits peuvent maintenant être créés sans code-barres
- Seuls nom + référence interne sont requis
- Formulaire fonctionne comme prévu
