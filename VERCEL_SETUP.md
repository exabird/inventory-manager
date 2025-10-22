# 🚀 Guide de Déploiement Vercel

## Étape 1 : Connecter GitHub à Vercel

1. Allez sur **https://vercel.com/new**
2. Sélectionnez "Import Git Repository"
3. Cherchez et sélectionnez : **exabird/inventory-manager**
4. Cliquez sur "Import"

## Étape 2 : Configuration du Projet

### Framework Preset
- **Framework** : Next.js (détecté automatiquement)
- **Build Command** : `npm run build` (par défaut)
- **Output Directory** : `.next` (par défaut)

### Variables d'Environnement

Ajoutez ces 3 variables d'environnement :

```env
NEXT_PUBLIC_SUPABASE_URL=https://nuonbtjrtacfjifnrziv.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b25idGpydGFjZmppZm5yeml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODAzNjQsImV4cCI6MjA3NjU1NjM2NH0.WvQNCCfVv9_QBmHlCQZcoq8rnftgL_5stiAzD_Kt8H4

SUPABASE_SERVICE_ROLE_KEY=[À récupérer depuis Supabase]
```

### Comment obtenir la SUPABASE_SERVICE_ROLE_KEY :

1. Allez sur **https://supabase.com/dashboard**
2. Sélectionnez le projet **"Inventor AI"**
3. Allez dans **Settings** → **API**
4. Copiez la clé **service_role** (section "Project API keys")

## Étape 3 : Déployer

1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes que le déploiement se termine
3. Vous obtiendrez une URL comme : `https://inventory-manager-xxx.vercel.app`

## Étape 4 : Tester sur iPhone

Une fois déployé, ouvrez l'URL Vercel sur votre iPhone :

✅ **Safari** : Le scanner de caméra fonctionnera parfaitement
✅ **Chrome** : Le scanner de caméra fonctionnera parfaitement

**Le HTTPS résout tous les problèmes de permissions caméra sur iOS !**

## Déploiements Automatiques

Vercel est maintenant connecté à votre repository GitHub :
- Chaque `git push` sur la branche `main` → Déploiement en production
- Chaque Pull Request → Déploiement de preview

## URLs utiles

- **Dashboard Vercel** : https://vercel.com/dashboard
- **Repository GitHub** : https://github.com/exabird/inventory-manager
- **Dashboard Supabase** : https://supabase.com/dashboard/project/nuonbtjrtacfjifnrziv




