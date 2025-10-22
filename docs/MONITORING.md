# 🔍 SURVEILLANCE AUTOMATIQUE - INVENTORY MANAGER

## Scripts Disponibles

### 🚀 Développement avec Surveillance
```bash
# Surveillance continue des logs avec auto-correction
npm run dev:monitor

# Redémarrage propre du serveur
npm run dev:clean

# Vérification du build
npm run build:check
```

### 🧪 Tests et Diagnostics
```bash
# Test du serveur
npm run test:server

# Vérification TypeScript
npm run type-check

# Linting avec correction auto
npm run lint:fix

# Surveillance des logs d'erreur
npm run logs:error
```

## 🛠️ Bonnes Pratiques Intégrées

### 1. **Surveillance Continue**
- ✅ Détection automatique des erreurs
- ✅ Suggestions de correction
- ✅ Logs colorés et structurés
- ✅ Historique des erreurs

### 2. **Validation Automatique**
- ✅ TypeScript strict
- ✅ ESLint avec règles Next.js
- ✅ Prettier pour le formatage
- ✅ Vérification des imports

### 3. **Tests de Santé**
- ✅ Test HTTP automatique
- ✅ Vérification des variables d'environnement
- ✅ Validation de la connexion Supabase
- ✅ Check de la base de données

## 🔧 Correction des Erreurs Courantes

### Erreur: "supabaseKey is required"
**Solution:** Vérifier `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`

### Erreur: "Cannot find module"
**Solution:** `npm install` ou vérifier les imports

### Erreur: "Hydration failed"
**Solution:** Vérifier les différences client/serveur

### Erreur: "TypeError"
**Solution:** Vérifier les types TypeScript

## 📊 Monitoring en Temps Réel

Le script `dev:monitor` surveille :
- ✅ Erreurs de compilation
- ✅ Erreurs runtime
- ✅ Warnings TypeScript
- ✅ Problèmes de connexion Supabase
- ✅ Erreurs de build

## 🎯 Utilisation Recommandée

```bash
# 1. Démarrer avec surveillance
npm run dev:monitor

# 2. Dans un autre terminal, faire vos modifications
# Les erreurs seront détectées automatiquement

# 3. Si erreur persistante
npm run dev:clean
npm run build:check
npm run type-check
```

---

**Prochaine étape : Donnez-moi la service_role key pour corriger l'erreur actuelle !** 🔑
