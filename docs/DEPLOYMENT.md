# 🚀 Guide de Déploiement - Inventory Manager

## Déploiement sur Vercel (Recommandé)

Vercel est la plateforme recommandée pour déployer cette application Next.js.

### Prérequis

- Compte GitHub
- Compte Vercel (gratuit)
- Repository GitHub avec le code

### Étapes

#### 1. Préparer le Repository

```bash
# Initialiser git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit: Inventory Manager v1.0"

# Créer un repo sur GitHub
# Puis pusher
git remote add origin https://github.com/votre-username/inventory-app.git
git branch -M main
git push -u origin main
```

#### 2. Connecter à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez sur **Add New Project**
4. Importez votre repository `inventory-app`

#### 3. Configurer le Projet

**Framework Preset**: Next.js (détecté automatiquement)

**Build Settings**:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Development Command: `npm run dev`

**Root Directory**: `./` (racine)

#### 4. Variables d'Environnement

Dans **Settings** → **Environment Variables**, ajoutez :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...
NEXT_PUBLIC_SITE_URL=https://votre-app.vercel.app
NEXT_PUBLIC_APP_NAME=Inventory Manager
```

**Important** : 
- Utilisez les **vraies valeurs** de votre projet Supabase
- `NEXT_PUBLIC_SITE_URL` doit être l'URL de votre app Vercel

#### 5. Déployer

1. Cliquez sur **Deploy**
2. Attendez 2-3 minutes
3. Votre app est en ligne ! 🎉

L'URL sera du type : `https://inventory-app-xxx.vercel.app`

### Configuration HTTPS pour le Scanner

⚠️ **Important** : Le scanner de codes-barres nécessite HTTPS !

Sur Vercel, c'est automatique. Votre app sera accessible en HTTPS par défaut.

### Domaine Personnalisé (Optionnel)

1. Dans Vercel → **Settings** → **Domains**
2. Ajoutez votre domaine (ex: `inventory.monsite.com`)
3. Configurez les DNS selon les instructions
4. Certificat SSL automatique

---

## Déploiement sur d'Autres Plateformes

### Netlify

1. Connectez votre repo GitHub
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Ajoutez les variables d'environnement
5. Déployez

### Railway

1. Créez un nouveau projet
2. Connectez GitHub
3. Ajoutez les variables d'environnement
4. Railway détecte Next.js automatiquement
5. Déployez

### AWS Amplify

1. Console AWS Amplify
2. Connectez GitHub
3. Build settings automatiques
4. Ajoutez les variables
5. Déployez

---

## Configuration de Production

### Supabase

#### Sécuriser les Politiques RLS

⚠️ **Important** : Par défaut, les politiques sont ouvertes (tous peuvent lire/écrire).

Pour la production, **restreindre les accès** :

```sql
-- Supprimer les politiques ouvertes
DROP POLICY IF EXISTS "Allow public read access on products" ON products;
DROP POLICY IF EXISTS "Allow public insert on products" ON products;
DROP POLICY IF EXISTS "Allow public update on products" ON products;
DROP POLICY IF EXISTS "Allow public delete on products" ON products;

-- Créer des politiques authentifiées uniquement
CREATE POLICY "Authenticated users can read products"
  ON products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');
```

#### Activer l'Authentification

1. Dans Supabase → **Authentication** → **Providers**
2. Activez **Email** (Magic Link recommandé)
3. Configurez les URLs de redirection :
   - Site URL: `https://votre-app.vercel.app`
   - Redirect URLs: `https://votre-app.vercel.app/**`

### Next.js

#### Optimisations

Dans `next.config.ts`, ajouter :

```typescript
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};
```

---

## Maintenance

### Mettre à Jour l'Application

```bash
# Développer les modifications
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

→ Vercel redéploie automatiquement !

### Rollback

Si une version a un problème :

1. Allez dans **Deployments** sur Vercel
2. Trouvez la version précédente stable
3. Cliquez sur les **⋮** → **Promote to Production**

### Monitoring

**Vercel Analytics** (gratuit) :

1. Dashboard Vercel → **Analytics**
2. Voir :
   - Visites
   - Core Web Vitals
   - Erreurs

**Supabase Monitoring** :

1. Dashboard Supabase → **Reports**
2. Voir :
   - Requêtes DB
   - API calls
   - Stockage

---

## Sauvegardes

### Base de Données

**Automatique** : Supabase sauvegarde automatiquement (plan gratuit : 7 jours)

**Manuel** :

```bash
# Exporter toutes les tables
curl "https://xxx.supabase.co/rest/v1/products?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  > backup-products.json

curl "https://xxx.supabase.co/rest/v1/categories?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  > backup-categories.json
```

### Code

→ GitHub sert de sauvegarde !

Recommandé : **Tags de version**

```bash
git tag -a v1.0.0 -m "Version 1.0.0 - MVP"
git push origin v1.0.0
```

---

## Sécurité en Production

### ✅ Checklist

- [ ] Variables d'environnement configurées
- [ ] HTTPS activé (automatique sur Vercel)
- [ ] Row Level Security activé et configuré
- [ ] Politiques Supabase restreintes (authentification requise)
- [ ] Headers de sécurité configurés
- [ ] Service Role Key **JAMAIS** exposée côté client
- [ ] `.env.local` dans `.gitignore`
- [ ] Domaine personnalisé avec SSL (optionnel)

### Tester la Sécurité

```bash
# Vérifier les headers
curl -I https://votre-app.vercel.app

# Devrait afficher:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
```

---

## Troubleshooting Production

### Erreur 500

1. Vérifiez les **logs Vercel** : Dashboard → Deployments → Logs
2. Vérifiez les **logs Supabase** : Dashboard → Logs
3. Variables d'environnement correctes ?

### Scanner ne Fonctionne Pas

- ✅ HTTPS activé ? (oui sur Vercel)
- ✅ Permissions caméra accordées ?
- ✅ Testé sur mobile ?

### Base de Données Lente

1. Supabase → Database → Indexes
2. Vérifiez que les index existent sur :
   - `products.barcode`
   - `products.name`
   - `products.internal_ref`

### Build Échoue

```bash
# Tester en local
npm run build

# Si OK en local mais pas sur Vercel :
# → Vérifier Node version
# → Vérifier variables d'environnement
```

---

## Support

- **Vercel** : [vercel.com/docs](https://vercel.com/docs)
- **Supabase** : [supabase.com/docs](https://supabase.com/docs)
- **Next.js** : [nextjs.org/docs](https://nextjs.org/docs)

---

## 🎉 Félicitations !

Votre application d'inventaire est maintenant en production !

### Prochaines Étapes

1. Testez toutes les fonctionnalités en production
2. Configurez l'authentification si nécessaire
3. Ajoutez un domaine personnalisé
4. Activez Vercel Analytics
5. Partagez avec vos utilisateurs ! 🚀

