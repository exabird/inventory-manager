# 📋 PROCESSUS DE DÉVELOPPEMENT - INVENTORY MANAGER

## 🎯 RÈGLES FONDAMENTALES

### 1. **VERSIONING OBLIGATOIRE** ⚠️
**À CHAQUE MODIFICATION DE L'APPLICATION, LA VERSION DOIT ÊTRE MISE À JOUR**

#### Processus de versioning :
1. **Avant tout commit** avec des modifications fonctionnelles
2. **Utiliser les scripts npm** :
   ```bash
   npm run version:patch  # Corrections de bugs
   npm run version:minor  # Nouvelles fonctionnalités
   npm run version:major  # Changements majeurs
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

### 2. **COMMIT ET DÉPLOIEMENT** 🚀
#### Processus complet :
```bash
# 1. Mettre à jour la version
npm run version:patch

# 2. Ajouter les fichiers
git add .

# 3. Committer avec message descriptif
git commit -m "📦 Version X.X.X - Description des changements"

# 4. Pousser vers GitHub
git push origin main

# 5. Vercel déploie automatiquement
```

#### Format des messages de commit :
- **📦** : Nouvelle version
- **🎨** : Améliorations UX/UI
- **🐛** : Corrections de bugs
- **✨** : Nouvelles fonctionnalités
- **🔧** : Améliorations techniques
- **📝** : Documentation

### 3. **TESTS ET VALIDATION** ✅
#### Avant chaque déploiement :
```bash
# 1. Vérifier la compilation
npm run build:check

# 2. Vérifier les erreurs de linting
npm run lint

# 3. Tester en local
npm run dev
# Ouvrir http://localhost:3000 et tester les fonctionnalités
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

### 6. **DÉPLOIEMENT** 🌐
#### Environnements :
- **Local** : `http://localhost:3000` (développement)
- **Production** : `https://stock.exabird.be/` (Vercel)

#### Processus de déploiement :
1. **Commit sur main** → Déploiement automatique Vercel
2. **Vérifier le déploiement** sur l'URL de production
3. **Tester les fonctionnalités** en production
4. **Vérifier les logs** en cas de problème

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

### ❌ **Commits sans tests**
- **Conséquence** : Bugs en production
- **Solution** : Toujours tester avant commit

### ❌ **Modifications de DB sans migration**
- **Conséquence** : Erreurs en production
- **Solution** : Toujours utiliser des migrations

### ❌ **Déploiement sans vérification**
- **Conséquence** : Bugs non détectés
- **Solution** : Toujours tester après déploiement

## 📞 ESCALADE ET SUPPORT

### En cas de blocage :
1. **Vérifier les logs** (navigateur, Supabase, Vercel)
2. **Consulter la documentation** existante
3. **Tester les APIs** directement
4. **Demander de l'aide** avec contexte complet

### Informations à fournir :
- **Version actuelle** de l'application
- **Logs d'erreur** complets
- **Étapes de reproduction**
- **Environnement** (local/production)

---

## 🔄 CHECKLIST DE DÉVELOPPEMENT

### Avant de commencer :
- [ ] Comprendre la demande utilisateur
- [ ] Planifier les modifications nécessaires
- [ ] Vérifier l'impact sur l'existant

### Pendant le développement :
- [ ] Tester chaque modification
- [ ] Vérifier la compilation
- [ ] Documenter les changements

### Avant le commit :
- [ ] Mettre à jour la version
- [ ] Mettre à jour le CHANGELOG
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier les erreurs de linting

### Après le commit :
- [ ] Vérifier le déploiement automatique
- [ ] Tester en production
- [ ] Vérifier les logs
- [ ] Informer l'utilisateur

---

**⚠️ IMPORTANT : Ces processus sont OBLIGATOIRES et doivent être suivis systématiquement pour maintenir la qualité et la cohérence du projet.**
