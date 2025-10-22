# 📦 Inventory Manager

Application web mobile-first pour la gestion intelligente de votre stock de marchandises avec scan de codes-barres et QR codes.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Fonctionnalités

### Phase 1 : MVP (Version Actuelle) ✅

- **📸 Scanner de codes-barres/QR codes** - Utilisez la caméra de votre appareil pour scanner instantanément
- **➕ Ajout manuel de produits** - Formulaire complet avec validation
- **📋 Liste des produits** - Vue en grille responsive avec recherche
- **🔍 Recherche avancée** - Par nom, code-barres, référence ou fabricant
- **📊 Gestion du stock** - Incrémentation/décrémentation rapide des quantités
- **✏️ Édition** - Modification complète des informations produit
- **🗑️ Suppression** - Avec confirmation sécurisée
- **📈 Statistiques** - Vue d'ensemble de votre inventaire
- **📱 Mobile-first** - Interface optimisée pour smartphone et tablette
- **🎨 UI moderne** - Design avec Shadcn/ui et Tailwind CSS

### Phase 2 : Enrichissement IA (À venir) 🚀

- **🤖 Claude API** - Scraping intelligent des métadonnées
- **🌐 APIs produits** - Intégration Open Food Facts, UPC Database
- **✨ Auto-complétion** - Remplissage automatique des informations
- **🏷️ Suggestions** - Catégories et tags intelligents
- **🖼️ Images automatiques** - Téléchargement depuis les bases de données

### Phase 3 : Fonctionnalités Avancées (À venir) 🎯

- **👥 Multi-utilisateurs** - Gestion des rôles et permissions
- **🎛️ Panel admin** - Interface Refine.dev
- **📊 Analytics** - Statistiques et rapports détaillés
- **⚠️ Alertes** - Notifications de stock bas
- **📤 Export** - CSV, PDF, Excel
- **🔔 Notifications** - Push et email

## 🛠️ Stack Technique

### Framework & Core
- **Next.js** 15.5.4 - Framework React avec App Router
- **React** 19.2.0 - Bibliothèque UI
- **TypeScript** 5.9.3 - Typage statique

### UI & Styling
- **Tailwind CSS** 3.4.18 - Framework CSS utilitaire
- **Shadcn/ui** - Composants React (Radix UI)
- **Lucide React** - Icônes
- **Framer Motion** - Animations

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Base de données
- **Row Level Security** - Sécurité des données

### Formulaires & Validation
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation de schémas

### Scanner
- **html5-qrcode** - Scan de codes-barres/QR codes

## 🚀 Installation

### Prérequis

- Node.js 18+ installé
- Compte Supabase (gratuit)
- npm ou pnpm

### Étapes

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd inventory-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Supabase**

- Créez un compte sur [supabase.com](https://supabase.com)
- Créez un nouveau projet
- Copiez l'URL et les clés API

4. **Configurer les variables d'environnement**

Créez un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Inventory Manager
```

5. **Créer la base de données**

- Allez dans votre projet Supabase → SQL Editor
- Copiez et exécutez le contenu de `docs/database-setup.sql`

6. **Lancer l'application**

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📖 Guide d'Utilisation

### Scanner un Produit

1. Cliquez sur le bouton **caméra** (bleu) en bas à droite
2. Autorisez l'accès à la caméra
3. Pointez vers un code-barres ou QR code
4. Le scan se fait automatiquement

### Ajouter un Produit Manuellement

1. Cliquez sur le bouton **+** en bas à droite
2. Remplissez le formulaire :
   - **Code-barres** (obligatoire)
   - **Nom du produit** (obligatoire)
   - **Fabricant** (optionnel)
   - **Référence interne** (optionnel)
   - **Quantité** (obligatoire)
   - **Catégorie** (optionnel)
   - **URL image** (optionnel)
   - **Notes** (optionnel)
3. Cliquez sur **Ajouter le produit**

### Gérer le Stock

- **Augmenter** : Cliquez sur le bouton **+** sur la carte produit
- **Diminuer** : Cliquez sur le bouton **-** sur la carte produit
- Les modifications sont instantanées

### Rechercher un Produit

Utilisez la barre de recherche en haut :
- Par nom : "iPhone"
- Par code-barres : "1234567890"
- Par fabricant : "Apple"
- Par référence : "REF-12345"

### Éditer un Produit

1. Cliquez sur **Éditer** sur la carte produit
2. Modifiez les informations
3. Cliquez sur **Mettre à jour**

### Supprimer un Produit

1. Cliquez sur l'icône **poubelle** sur la carte produit
2. Confirmez la suppression

## 🗄️ Structure de la Base de Données

### Table: `products`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| barcode | VARCHAR(255) | Code-barres/QR code (unique) |
| name | VARCHAR(500) | Nom du produit |
| manufacturer | VARCHAR(255) | Fabricant |
| internal_ref | VARCHAR(100) | Référence interne |
| quantity | INTEGER | Quantité en stock |
| notes | TEXT | Notes |
| category_id | UUID | Catégorie (FK) |
| image_url | TEXT | URL de l'image |
| metadata | JSONB | Métadonnées (pour IA) |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |

### Table: `categories`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| name | VARCHAR(255) | Nom de la catégorie |
| description | TEXT | Description |
| created_at | TIMESTAMP | Date de création |

### Table: `product_history`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| product_id | UUID | Produit (FK) |
| action | VARCHAR(50) | Type d'action |
| quantity_change | INTEGER | Changement de quantité |
| user_id | UUID | Utilisateur |
| notes | TEXT | Notes |
| created_at | TIMESTAMP | Date de l'action |

## 📱 Compatibilité

### Navigateurs

- ✅ Chrome/Edge (recommandé)
- ✅ Safari (iOS 14+)
- ✅ Firefox
- ⚠️ Le scanner nécessite HTTPS en production

### Appareils

- ✅ iPhone (iOS 14+)
- ✅ Android (Chrome)
- ✅ iPad/Tablettes
- ✅ Desktop (avec webcam)

## 🔒 Sécurité

- **Row Level Security** activé sur Supabase
- **Variables d'environnement** pour les clés sensibles
- **HTTPS** obligatoire en production pour la caméra
- **Validation côté serveur** avec Zod

## 🚢 Déploiement

### Vercel (Recommandé)

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Autres Plateformes

L'application fonctionne sur toute plateforme supportant Next.js :
- Netlify
- Railway
- AWS Amplify
- etc.

## 🛠️ Scripts

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Linting
npm run lint

# Formatage
npm run format
```

## 📝 Roadmap

### Version 1.0 (Actuelle) ✅
- [x] Scanner de codes-barres/QR
- [x] CRUD complet des produits
- [x] Gestion du stock
- [x] Recherche et filtres
- [x] Interface mobile-first

### Version 1.1 (Prochaine)
- [ ] Intégration Claude API
- [ ] Auto-complétion des métadonnées
- [ ] API Open Food Facts
- [ ] Import/Export CSV
- [ ] Mode hors-ligne (PWA)

### Version 2.0 (Future)
- [ ] Panel admin Refine.dev
- [ ] Multi-utilisateurs
- [ ] Statistiques avancées
- [ ] Notifications
- [ ] Application mobile native

## 🐛 Problèmes Connus

- Le scanner peut être lent sur certains appareils anciens
- Safari iOS nécessite HTTPS pour la caméra (même en dev)
- Les catégories doivent être créées manuellement pour l'instant

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 License

Ce projet est sous license MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👤 Auteur

Anthony - [Exabird Team](https://github.com/exabird)

## 🙏 Remerciements

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [html5-qrcode](https://github.com/mebjas/html5-qrcode)

---

**Made with ❤️ and ☕ by Anthony**
