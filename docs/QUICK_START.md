# 🚀 Guide de Démarrage Rapide - Inventory Manager

## ⚡ En 5 Minutes

### 1. Installation Express

```bash
# Cloner et installer
git clone <url-du-repo>
cd inventory-app
npm install
```

### 2. Configuration Supabase

#### A. Créer un Projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte gratuit
3. Cliquez sur "New Project"
4. Choisissez :
   - **Organization** : Votre organisation
   - **Name** : inventory-manager
   - **Database Password** : Choisissez un mot de passe fort
   - **Region** : Closest to you (Europe West par exemple)
   - **Pricing Plan** : Free
5. Attendez 1-2 minutes que le projet se crée

#### B. Récupérer les Clés API

1. Dans votre projet Supabase, allez dans **Settings** → **API**
2. Copiez :
   - **Project URL** : `https://xxx.supabase.co`
   - **anon public** : La clé commençant par `eyJ...`
   - **service_role** : La clé service (⚠️ à garder secrète)

#### C. Configurer les Variables d'Environnement

Créez le fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Inventory Manager
```

**Remplacez** `xxx` par vos vraies valeurs !

### 3. Créer la Base de Données

1. Dans Supabase, allez dans **SQL Editor**
2. Cliquez sur **New Query**
3. Ouvrez le fichier `docs/database-setup.sql`
4. Copiez **tout** le contenu
5. Collez dans l'éditeur SQL
6. Cliquez sur **Run** (ou Ctrl+Enter)
7. Attendez que les tables se créent (quelques secondes)

✅ Vous devriez voir un message de succès !

### 4. Lancer l'Application

```bash
npm run dev
```

🎉 Ouvrez [http://localhost:3000](http://localhost:3000)

---

## 📱 Premier Scan

### Option 1 : Scanner un Vrai Produit

1. Cliquez sur le **bouton caméra** (bleu) en bas à droite
2. **Autorisez** l'accès à la caméra
3. Pointez vers un code-barres d'un produit
4. Le scan se fait automatiquement !
5. Remplissez les informations du produit
6. Cliquez sur **Ajouter le produit**

### Option 2 : Ajouter Manuellement

1. Cliquez sur le **bouton +** en bas à droite
2. Remplissez le formulaire :
   ```
   Code-barres: 1234567890123
   Nom: iPhone 15 Pro
   Fabricant: Apple
   Quantité: 5
   ```
3. Cliquez sur **Ajouter le produit**

---

## ✅ Vérification

Vous devriez voir :

- ✅ Une **carte de produit** dans la liste
- ✅ Les **statistiques** en haut (1 produit, 5 articles)
- ✅ La **barre de recherche** fonctionnelle
- ✅ Les **boutons d'action** flottants

---

## 🎯 Fonctionnalités à Tester

### Gestion du Stock
- Cliquez sur **+** ou **-** sur une carte → quantité change
- Vérifiez que les stats se mettent à jour

### Recherche
- Tapez le nom du produit dans la barre de recherche
- Tapez le code-barres
- La liste se filtre en temps réel

### Édition
- Cliquez sur **Éditer**
- Modifiez les informations
- Cliquez sur **Mettre à jour**

### Suppression
- Cliquez sur l'icône **poubelle**
- Confirmez
- Le produit disparaît

---

## 🐛 Problèmes Courants

### Erreur : "Supabase URL is not defined"

❌ **Problème** : Les variables d'environnement ne sont pas chargées

✅ **Solution** :
1. Vérifiez que `.env.local` existe à la racine
2. Vérifiez que les variables sont correctes
3. **Redémarrez** le serveur : `Ctrl+C` puis `npm run dev`

### Erreur : "Cannot read property 'from' of undefined"

❌ **Problème** : Les clés Supabase sont incorrectes

✅ **Solution** :
1. Retournez dans Supabase → Settings → API
2. Copiez à nouveau les clés
3. Collez dans `.env.local`
4. Redémarrez le serveur

### Le Scanner ne Fonctionne Pas

❌ **Problème** : Permission caméra refusée ou HTTPS requis

✅ **Solution** :
1. **Autorisez** l'accès à la caméra dans votre navigateur
2. Sur **Safari iOS**, utilisez HTTPS même en dev (ou utilisez un tunnel comme ngrok)
3. Essayez avec **Chrome** sur Android

### Aucune Catégorie Disponible

✅ **Normal** ! Les catégories de test sont créées par le script SQL.

Si elles n'apparaissent pas :
1. Allez dans Supabase → Table Editor → `categories`
2. Vérifiez qu'il y a des lignes
3. Sinon, relancez la partie du script SQL qui insère les catégories

### Page Blanche / Erreur 500

❌ **Problème** : Erreur de build ou de connexion

✅ **Solution** :
1. Regardez la **console** du terminal (erreurs affichées)
2. Regardez la **console** du navigateur (F12)
3. Vérifiez que Supabase est bien connecté :
   ```bash
   # Dans la console du navigateur :
   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```

---

## 📚 Ressources

- [README Principal](../README.md) - Documentation complète
- [Changelog](CHANGELOG.md) - Historique des versions
- [Script SQL](database-setup.sql) - Structure de la base de données

---

## 🆘 Besoin d'Aide ?

1. **Consultez** le README complet
2. **Vérifiez** les problèmes connus
3. **Ouvrez** une issue sur GitHub

---

## 🎉 Prêt à Utiliser !

Vous avez maintenant une application d'inventaire fonctionnelle !

### Prochaines Étapes

- 📦 Ajoutez vos vrais produits
- 🏷️ Créez vos propres catégories
- 📊 Consultez les statistiques
- 🚀 Déployez sur Vercel (voir README)

### Phase 2 - Enrichissement IA

Dans la prochaine version, vous pourrez :
- Laisser Claude API remplir automatiquement les infos
- Scanner un code-barres → toutes les infos se remplissent !
- Suggestions intelligentes de catégories

---

**Bon inventaire ! 📦✨**





