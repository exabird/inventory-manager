# Instructions pour l'Agent IA - Inventory Manager

## 🎯 Votre Rôle

Vous êtes un agent IA assistant au développement de **Inventory Manager**, une application Next.js 16 professionnelle de gestion d'inventaire.

**Version actuelle** : 0.1.12  
**Production** : https://stock.exabird.be/  
**Statut** : 100% fonctionnel, stable

## 📋 Processus OBLIGATOIRE

### Workflow en 6 Étapes

1. **Développement local**
   - Développer les modifications
   - Tester avec `npm run dev`
   - Tester manuellement dans le navigateur

2. **Tests locaux OBLIGATOIRES**
   ```bash
   npm run build:check  # Compilation
   npm run lint        # Linting
   npm run type-check  # TypeScript
   ./test-app.sh       # Tests complets
   ```

3. **Validation utilisateur OBLIGATOIRE**
   - **ATTENDRE** la validation explicite
   - Ne **JAMAIS déployer** sans validation
   - Phrases acceptables : "OK pour déployer", "Go", "Validation OK"

4. **Versioning**
   ```bash
   npm run version:patch  # V0.0.X (corrections, améliorations)
   # Pour minor/major : DEMANDER confirmation d'abord
   ```

5. **Commit**
   ```bash
   git commit -m "📦 Version X.X.X - Description"
   ```

6. **Déploiement**
   - Push vers GitHub (via MCP si disponible)
   - Attendre 45 secondes pour Vercel
   - Vérifier les logs de déploiement
   - Confirmer le bon fonctionnement à l'utilisateur

## ✅ Ce que vous DEVEZ TOUJOURS Faire

1. ✅ Attendre validation utilisateur avant tout déploiement
2. ✅ Incrémenter version avant chaque commit fonctionnel
3. ✅ Exécuter TOUS les tests obligatoires
4. ✅ Typer strictement en TypeScript (0 `any` toléré)
5. ✅ Commenter le code en français
6. ✅ Utiliser les logs structurés avec emojis
7. ✅ Utiliser les composants Shadcn/ui existants
8. ✅ Suivre les conventions de code des règles

## ❌ Ce que vous ne devez JAMAIS Faire

1. ❌ Déployer sans validation utilisateur explicite
2. ❌ Incrémenter version minor/major sans confirmation
3. ❌ Utiliser `any` en TypeScript
4. ❌ Créer des composants classe React
5. ❌ Sauter les tests obligatoires
6. ❌ Ignorer les erreurs TypeScript
7. ❌ Commenter en anglais
8. ❌ Modifier `docs/DEVELOPMENT_PROCESSES.md` sans validation

## 📚 Documentation Essentielle

Consultez ces fichiers pour comprendre le projet :

- **Architecture** : `docs/ARCHITECTURE_GUIDE.md` (97 KB)
- **Processus** : `docs/DEVELOPMENT_PROCESSES.md`
- **Debugging** : `docs/DEBUGGING_GUIDE.md` (159 KB)
- **État actuel** : `SYNTHESE_RESTRUCTURATION.md`
- **Bugs connus** : `PROBLEMES_CORRIGES.md`
- **Règles Cursor** : `.cursor/rules/*.mdc`

## 🏗️ Architecture Simplifiée

```
Frontend : Next.js 16 + React 19 + TypeScript 5
UI : Shadcn/ui + Tailwind CSS 4 (mobile-first)
Backend : Supabase (PostgreSQL + Storage + RLS)
```

### Services Principaux

**ProductService** (`src/lib/services.ts`)
- `getAll()` : Tous les produits avec catégories
- `getByBarcode(code)` : Recherche par code-barres
- `create(product)` : Créer un produit
- `update(id, updates)` : Mettre à jour
- `delete(id)` : Supprimer

**StockService** (`src/lib/stockService.ts`)
- `performStockOperation(productId, operation)` : Opération de stock
- `getOperationHistory(productId)` : Historique
- `updateMinStockSettings(productId, settings)` : Stock minimum

## 🎯 Métriques de Qualité

Objectifs à maintenir :
- **0 erreur TypeScript** (obligatoire)
- **Build réussi** (obligatoire)
- **Tests** : 83%+ de réussite
- **Performance** : Chargement < 2s
- **Responsive** : Mobile-first parfait

## 🔍 En Cas de Problème

1. Consulter `docs/DEBUGGING_GUIDE.md`
2. Consulter `PROBLEMES_CORRIGES.md`
3. Utiliser `node monitor-realtime-console.js`
4. Analyser les logs (navigateur, serveur, Supabase)

## 💡 Règles de Versioning STRICTES

### Patch (V0.0.Z)
- Corrections de bugs
- Améliorations mineures
- **Agent peut incrémenter automatiquement**

### Minor (V0.X.0)
- Nouvelles features complètes
- **NÉCESSITE confirmation utilisateur**
- **NE PAS incrémenter sans demander**

### Major (VX.0.0)
- Changements majeurs
- **NÉCESSITE confirmation utilisateur**
- **NE PAS incrémenter sans demander**

## 📝 Exemples de Tâches Fréquentes

### Ajouter un Nouveau Champ au Produit

1. Ajouter colonne dans Supabase
2. Mettre à jour interface `Product` dans `src/lib/supabase.ts`
3. Ajouter champ dans `ProductInspector.tsx`
4. Mettre à jour `ProductService` si nécessaire
5. Tester : création, modification, affichage

### Créer un Nouveau Composant

1. Créer fichier dans `components/inventory/` ou `components/ui/`
2. Composant fonctionnel avec TypeScript
3. Typer strictement les props
4. Utiliser composants Shadcn/ui existants
5. Ajouter logs de debug
6. Tester sur mobile et desktop

### Débugger un Problème

1. Consulter `docs/DEBUGGING_GUIDE.md`
2. Vérifier logs (navigateur F12, serveur, Supabase)
3. Reproduire localement
4. Consulter `PROBLEMES_CORRIGES.md`
5. Utiliser `monitor-realtime-console.js`
6. Corriger et tester exhaustivement

## ⚡ Commandes Essentielles

```bash
# Développement
npm run dev              # Lancer l'app
npm run build:check      # Vérifier compilation
npm run lint             # Vérifier linting
npm run type-check       # Vérifier TypeScript

# Tests
./test-app.sh            # Tests complets

# Versioning
npm run version:patch    # V0.0.X (auto OK)
npm run version:show     # Afficher version

# Monitoring
node monitor-realtime-console.js   # Monitoring temps réel
```

## 🎓 Premiers Pas

Si c'est votre première interaction avec ce projet :

1. Lire ce fichier (AGENTS.md) en entier ✓
2. Consulter les règles dans `.cursor/rules/*.mdc`
3. Lire `START_HERE.md` pour vue d'ensemble
4. Consulter `docs/ARCHITECTURE_GUIDE.md` pour architecture
5. Lancer `./test-app.sh` pour vérifier l'environnement

## 🤝 Communication avec l'Utilisateur

### Présentation des Modifications

Toujours présenter :
- Ce qui a été fait
- Fichiers modifiés
- Tests effectués
- Résultats des tests

### Demande de Validation

**Phrases type :**
- "Modifications terminées et testées. OK pour déployer ?"
- "Tests réussis (build ✅, lint ✅, type-check ✅). Validation pour déployer ?"

### Confirmation Déploiement

Après déploiement, confirmer :
- Version déployée
- URL production
- Status : ✅ ou ❌
- Modifications déployées
- Tests effectués en production

## 🎯 Votre Objectif

Produire du **code de qualité professionnelle** en suivant strictement :
- Les processus obligatoires
- Les conventions de code
- Les règles de versioning
- Le workflow de développement

**Toujours privilégier la qualité sur la vitesse.**

---

**Les règles détaillées sont dans `.cursor/rules/*.mdc` - consultez-les régulièrement !**

