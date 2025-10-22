# Configuration des variables d'environnement sur Vercel

## 🔑 Variables requises

Ajoutez ces variables dans **Vercel Dashboard** → **Settings** → **Environment Variables** :

```
NEXT_PUBLIC_SUPABASE_URL=https://nuonbtjrtacfjifnrziv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b25idGpydGFjZmppZm5yeml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODAzNjQsImV4cCI6MjA3NjU1NjM2NH0.WvQNCCfVv9_QBmHlCQZcoq8rnftgL_5stiAzD_Kt8H4
```

## ⚠️ Problème actuel

L'application affiche "Chargement des produits..." indéfiniment car :
1. Les variables d'environnement ne sont PAS configurées sur Vercel
2. Le code utilise les valeurs par défaut en dur
3. Mais la clé API peut avoir expiré ou changé

## ✅ Solution

Les valeurs par défaut sont déjà dans le code (`src/lib/supabase.ts`), donc normalement ça devrait fonctionner sans configuration Vercel.

Le problème est ailleurs : **React ne met jamais à jour l'état `isLoading` à `false`**.

