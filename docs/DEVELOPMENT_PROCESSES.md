# 📋 PROCESSUS DE DÉVELOPPEMENT - INVENTORY MANAGER

## 🎯 RÈGLES FONDAMENTALES

### 1. **VERSIONING OBLIGATOIRE** ⚠️
**À CHAQUE MODIFICATION DE L'APPLICATION, LA VERSION DOIT ÊTRE MISE À JOUR**

#### Système de versioning sémantique :
**Format : VX.Y.Z** (ex: V1.0.0, V0.1.0, V0.0.24)

1. **Premier niveau VX.0.0** : Mise à jour majeure de l'application
   - Nouvelles fonctions importantes (au-delà de la gestion de stock)
   - Changements architecturaux majeurs
   - Exemple : V1.0.0, V2.0.0

2. **Second niveau V0.X.0** : Nouvelle feature complète et fonctionnelle
   - Ajout d'une fonctionnalité entièrement nouvelle
   - Exemples : Scraping données produit, IA, intégrations externes
   - Exemple : V0.1.0, V0.2.0

3. **Troisième niveau V0.0.Z** : Itération proposée
   - Améliorations, corrections, optimisations
   - Incrémenté à chaque itération de développement
   - Exemple : V0.0.24, V0.0.25

#### Processus de versioning :
1. **Avant tout commit** avec des modifications fonctionnelles
2. **Utiliser les scripts npm** :
   ```bash
   npm run version:patch  # V0.0.X (itérations)
   npm run version:minor  # V0.X.0 (nouvelles features)
   npm run version:major  # VX.0.0 (mises à jour majeures)
   ```
3. **Mettre à jour manuellement le CHANGELOG.md** si le script échoue
4. **Committer les changements de version** avec le code

#### Types de modifications nécessitant une nouvelle version :
- ✅ **Nouvelles fonctionnalités** (composants, pages, APIs)
- ✅ **Corrections de bugs** (erreurs, crashes)
- ✅ **Améliorations UX/UI** (design, interactions)
- ✅ **Modifications de base de données** (migrations, schémas)
- ✅ **Changements de configuration** (environnement, déploiement)
- ❌ **Corrections de typo** dans les commentaires
- ❌ **Refactoring sans changement fonctionnel**

### 2. **PROCESSUS DE DÉVELOPPEMENT ITÉRATIF** 🔄
#### Processus complet et obligatoire :

##### **ÉTAPE 1 : DÉVELOPPEMENT LOCAL** 💻
```bash
# 1. Développement des modifications
# 2. Tests en local
npm run dev
# Ouvrir http://localhost:3000 et tester manuellement
```

##### **ÉTAPE 2 : TESTS LOCAUX OBLIGATOIRES** ✅
```bash
# 1. Vérifier la compilation
npm run build:check

# 2. Vérifier les erreurs de linting
npm run lint

# 3. Tests fonctionnels locaux
curl -I http://localhost:3000  # Test serveur
# Tests navigateur : Console développeur → vérifier logs client
```

##### **ÉTAPE 3 : VÉRIFICATION LOGS SUPABASE** 🔍
```bash
# Via MCP Supabase - vérifier les logs
# Vérifier les erreurs, requêtes, performances
# S'assurer qu'il n'y a pas d'erreurs côté base de données
```

##### **ÉTAPE 4 : VALIDATION UTILISATEUR** 👤
- **Attendre la validation** de l'utilisateur
- **Corriger** si nécessaire selon les retours
- **Ne pas déployer** sans validation explicite

##### **ÉTAPE 5 : VERSIONING ET COMMIT** 📦
```bash
# 1. Mettre à jour la version
npm run version:patch

# 2. Ajouter les fichiers
git add .

# 3. Committer avec message descriptif
git commit -m "📦 Version X.X.X - Description des changements"
```

##### **ÉTAPE 6 : DÉPLOIEMENT VIA MCP** 🚀
```bash
# 1. Push vers GitHub via MCP GitHub
# 2. Déploiement automatique Vercel
# 3. Attendre 45 secondes
# 4. Vérifier les logs de déploiement Vercel via MCP
```

#### Format des messages de commit :
- **📦** : Nouvelle version
- **🎨** : Améliorations UX/UI
- **🐛** : Corrections de bugs
- **✨** : Nouvelles fonctionnalités
- **🔧** : Améliorations techniques
- **📝** : Documentation

### 3. **TESTS ET VALIDATION DÉTAILLÉS** ✅
#### Tests locaux obligatoires :

##### **Tests de compilation et linting** 🔧
```bash
# 1. Vérifier la compilation
npm run build:check

# 2. Vérifier les erreurs de linting
npm run lint

# 3. Vérifier les types TypeScript
npm run type-check
```

##### **Tests fonctionnels** 🧪
```bash
# 1. Serveur de développement
npm run dev

# 2. Test de connectivité serveur
curl -I http://localhost:3000

# 3. Tests navigateur (manuel)
# - Ouvrir http://localhost:3000
# - Ouvrir Console développeur (F12)
# - Vérifier les logs client (pas d'erreurs)
# - Tester toutes les fonctionnalités modifiées
# - Vérifier les interactions utilisateur
```

##### **Tests Supabase** 🗄️
```bash
# Via MCP Supabase
# 1. Vérifier les logs API
# 2. Vérifier les logs de base de données
# 3. Vérifier les performances des requêtes
# 4. S'assurer qu'il n'y a pas d'erreurs côté serveur
```

### 4. **GESTION DES ERREURS** 🔍
#### Processus de debug :
1. **Vérifier les logs** dans la console du navigateur
2. **Vérifier les logs Supabase** via MCP
3. **Vérifier les logs Vercel** via MCP
4. **Tester les APIs** directement
5. **Documenter les erreurs** dans le CHANGELOG

### 5. **BASE DE DONNÉES** 🗄️
#### Migrations :
- **Toujours utiliser des migrations** pour les changements de schéma
- **Tester les migrations** sur un environnement de test
- **Documenter les migrations** dans le CHANGELOG
- **Sauvegarder avant** les migrations importantes

#### RLS (Row Level Security) :
- **Toujours activer RLS** sur les nouvelles tables
- **Créer les politiques** appropriées
- **Tester les permissions** après création

### 6. **DÉPLOIEMENT VIA MCP** 🌐
#### Environnements :
- **Local** : `http://localhost:3000` (développement)
- **Production** : `https://stock.exabird.be/` (Vercel)

#### Processus de déploiement obligatoire :
1. **Push via MCP GitHub** → Déploiement automatique Vercel
2. **Attendre 45 secondes** pour le déploiement
3. **Vérifier les logs de déploiement Vercel** via MCP Vercel
4. **Tester les fonctionnalités** en production
5. **Vérifier les logs Supabase** en production
6. **Confirmer le bon fonctionnement** à l'utilisateur

### 7. **DOCUMENTATION** 📚
#### Mise à jour obligatoire :
- **CHANGELOG.md** : À chaque version
- **README.md** : Instructions d'installation et utilisation
- **docs/** : Documentation technique détaillée
- **Commentaires de code** : Pour les fonctions complexes

## 🚨 ERREURS FRÉQUENTES À ÉVITER

### ❌ **Oublier la mise à jour de version**
- **Conséquence** : Confusion sur les versions déployées
- **Solution** : Toujours vérifier la version avant commit

### ❌ **Déploiement sans validation utilisateur**
- **Conséquence** : Bugs en production, perte de temps
- **Solution** : **TOUJOURS ATTENDRE** la validation explicite

### ❌ **Tests locaux incomplets**
- **Conséquence** : Erreurs non détectées localement
- **Solution** : Suivre la checklist complète des tests

### ❌ **Oublier de vérifier les logs Supabase**
- **Conséquence** : Erreurs côté base de données non détectées
- **Solution** : Toujours vérifier via MCP Supabase

### ❌ **Déploiement sans vérification MCP Vercel**
- **Conséquence** : Problèmes de déploiement non détectés
- **Solution** : Attendre 45s et vérifier les logs Vercel

### ❌ **Modifications de DB sans migration**
- **Conséquence** : Erreurs en production
- **Solution** : Toujours utiliser des migrations

### ❌ **Tests navigateur négligés**
- **Conséquence** : Erreurs JavaScript côté client
- **Solution** : Toujours vérifier la console développeur

## 🛠️ OUTILS MCP DISPONIBLES

### MCP Supabase
- **Logs API** : Vérifier les erreurs et performances
- **Logs Database** : Vérifier les requêtes SQL
- **Logs Auth** : Vérifier l'authentification
- **Logs Storage** : Vérifier le stockage de fichiers
- **Logs Edge Functions** : Vérifier les fonctions serverless

### MCP Vercel
- **Logs de déploiement** : Vérifier le processus de build
- **Logs de runtime** : Vérifier les erreurs en production
- **Métriques** : Vérifier les performances
- **Déploiements** : Suivre l'état des déploiements

### MCP GitHub
- **Push automatique** : Déploiement via GitHub
- **Pull Requests** : Gestion des contributions
- **Issues** : Suivi des problèmes
- **Actions** : CI/CD automatique

## 📞 ESCALADE ET SUPPORT

### En cas de blocage :
1. **Vérifier les logs** (navigateur, Supabase, Vercel)
2. **Consulter la documentation** existante
3. **Tester les APIs** directement
4. **Utiliser les outils MCP** appropriés
5. **Demander de l'aide** avec contexte complet

### Informations à fournir :
- **Version actuelle** de l'application
- **Logs d'erreur** complets (navigateur, Supabase, Vercel)
- **Étapes de reproduction**
- **Environnement** (local/production)
- **Résultats des tests MCP**

## Système de Versioning STRICT

### Règles de versioning obligatoires

**IMPORTANT** : L'assistant ne peut JAMAIS incrémenter les niveaux V0.X.0 ou VX.0.0 sans confirmation explicite de l'utilisateur.

#### Premier Niveau : VX.0.0 (ex: V1.0.0, V2.0.0)
- **Définition** : Mise à jour majeure de l'application pour nouvelle feature importante
- **Exemples** : Ajout d'autres fonctions que la gestion de stock
- **Autorisation** : UNIQUEMENT avec confirmation explicite de l'utilisateur

#### Second Niveau : V0.X.0 (ex: V0.1.0, V0.2.0)
- **Définition** : Ajout d'une nouvelle feature complète et fonctionnelle
- **Exemples** : Scraping données produit AI, système d'images, etc.
- **Autorisation** : UNIQUEMENT avec confirmation explicite de l'utilisateur

#### Troisième Niveau : V0.0.Z (ex: V0.0.24, V0.1.10)
- **Définition** : Incrémenté à chaque itération proposée
- **Exemples** : Améliorations, corrections de bugs, optimisations
- **Autorisation** : L'assistant peut incrémenter automatiquement

### Processus de versioning

1. **Pour V0.0.Z** : L'assistant peut incrémenter automatiquement
2. **Pour V0.X.0** : L'assistant DOIT demander confirmation avant d'incrémenter
3. **Pour VX.0.0** : L'assistant DOIT demander confirmation avant d'incrémenter

### Exemples d'utilisation

- ✅ **Autorisé** : V0.1.9 → V0.1.10 (correction bug)
- ❌ **Interdit** : V0.1.9 → V0.2.0 (nouvelle feature sans confirmation)
- ❌ **Interdit** : V0.1.9 → V1.0.0 (mise à jour majeure sans confirmation)

---

## 🔄 CHECKLIST DE DÉVELOPPEMENT STRICTE

### Avant de commencer :
- [ ] Comprendre la demande utilisateur
- [ ] Planifier les modifications nécessaires
- [ ] Vérifier l'impact sur l'existant

### Pendant le développement :
- [ ] Développer les modifications localement
- [ ] Tester chaque modification en local
- [ ] Documenter les changements

### Tests locaux obligatoires :
- [ ] `npm run build:check` - Compilation OK
- [ ] `npm run lint` - Pas d'erreurs de linting
- [ ] `npm run type-check` - Types TypeScript OK
- [ ] `curl -I http://localhost:3000` - Serveur répond
- [ ] Tests navigateur - Console développeur sans erreurs
- [ ] Tests fonctionnels - Toutes les fonctionnalités modifiées
- [ ] Vérification logs Supabase via MCP

### Validation utilisateur :
- [ ] **ATTENDRE LA VALIDATION** de l'utilisateur
- [ ] Corriger si nécessaire selon les retours
- [ ] **NE PAS DÉPLOYER** sans validation explicite

### Avant le commit :
- [ ] Mettre à jour la version (`npm run version:patch`)
- [ ] Mettre à jour le CHANGELOG
- [ ] Ajouter les fichiers (`git add .`)
- [ ] Committer avec message descriptif

### Déploiement via MCP :
- [ ] Push vers GitHub via MCP GitHub
- [ ] Attendre 45 secondes pour le déploiement Vercel
- [ ] Vérifier les logs de déploiement Vercel via MCP
- [ ] Tester les fonctionnalités en production
- [ ] Vérifier les logs Supabase en production
- [ ] Confirmer le bon fonctionnement à l'utilisateur

## Système de Versioning STRICT

### Règles de versioning obligatoires

**IMPORTANT** : L'assistant ne peut JAMAIS incrémenter les niveaux V0.X.0 ou VX.0.0 sans confirmation explicite de l'utilisateur.

#### Premier Niveau : VX.0.0 (ex: V1.0.0, V2.0.0)
- **Définition** : Mise à jour majeure de l'application pour nouvelle feature importante
- **Exemples** : Ajout d'autres fonctions que la gestion de stock
- **Autorisation** : UNIQUEMENT avec confirmation explicite de l'utilisateur

#### Second Niveau : V0.X.0 (ex: V0.1.0, V0.2.0)
- **Définition** : Ajout d'une nouvelle feature complète et fonctionnelle
- **Exemples** : Scraping données produit AI, système d'images, etc.
- **Autorisation** : UNIQUEMENT avec confirmation explicite de l'utilisateur

#### Troisième Niveau : V0.0.Z (ex: V0.0.24, V0.1.10)
- **Définition** : Incrémenté à chaque itération proposée
- **Exemples** : Améliorations, corrections de bugs, optimisations
- **Autorisation** : L'assistant peut incrémenter automatiquement

### Processus de versioning

1. **Pour V0.0.Z** : L'assistant peut incrémenter automatiquement
2. **Pour V0.X.0** : L'assistant DOIT demander confirmation avant d'incrémenter
3. **Pour VX.0.0** : L'assistant DOIT demander confirmation avant d'incrémenter

### Exemples d'utilisation

- ✅ **Autorisé** : V0.1.9 → V0.1.10 (correction bug)
- ❌ **Interdit** : V0.1.9 → V0.2.0 (nouvelle feature sans confirmation)
- ❌ **Interdit** : V0.1.9 → V1.0.0 (mise à jour majeure sans confirmation)

---

**⚠️ IMPORTANT : Ces processus sont OBLIGATOIRES et doivent être suivis systématiquement pour maintenir la qualité et la cohérence du projet.**
