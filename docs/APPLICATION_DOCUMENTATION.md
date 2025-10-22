# 📱 INVENTORY MANAGER - DOCUMENTATION COMPLÈTE

## 🎯 VUE D'ENSEMBLE

**Inventory Manager** est une application web mobile-first de gestion de stock utilisant des codes-barres et QR codes existants. L'application permet de créer une base de données complète de produits avec métadonnées du fabricant et internes.

### 🏗️ Architecture Technique
- **Frontend** : Next.js 15 + React 19 + TypeScript
- **Styling** : Tailwind CSS 3.4.18 + Shadcn/ui
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **Déploiement** : Vercel
- **Scanner** : html5-qrcode
- **Version** : 0.0.22 (Semantic Versioning)

### 🌐 URLs
- **Production** : https://stock.exabird.be/
- **Local** : http://localhost:3000
- **GitHub** : https://github.com/exabird/inventory-manager

## 📋 FONCTIONNALITÉS PRINCIPALES

### 1. **Scanner de Codes-barres/QR** 📷
- **Détection multiple** : Scan simultané de plusieurs codes
- **Sélection intelligente** : Priorité UPC-A > EAN-13 > EAN-8
- **Caméra optimisée** : Ultra grand angle arrière par défaut
- **Fallback manuel** : Saisie manuelle si scan impossible
- **Support mobile** : Optimisé pour iOS/Android

### 2. **Gestion des Produits** 📦
- **Création** : Via scan ou saisie manuelle
- **Édition** : Modification des informations
- **Suppression** : Avec confirmation
- **Recherche** : Par nom, code-barres, fabricant, référence interne
- **Filtres** : Par statut de stock (Tous, En stock, Stock faible, Rupture)

### 3. **Interface Utilisateur** 🎨
- **Mobile-first** : Design responsive optimisé mobile
- **Vue Liste** : Interface compacte avec vignettes
- **Vue Grille** : Cartes détaillées pour desktop
- **Actions rapides** : Modification quantité directement dans la liste
- **Statuts visuels** : Codes couleur pour les quantités

### 4. **Gestion de Stock** 📊
- **Wizard intuitif** : Interface guidée pour les opérations de stock
- **3 types d'opérations** : Ajouter, Retirer, Corriger le stock
- **Raisons prédéfinies** : 17 raisons métier pour traçabilité
- **Historique complet** : Toutes les opérations enregistrées
- **Stock minimum** : Alertes configurables

### 5. **Scraping IA** 🤖
- **Recherche automatique** : IA cherche sur les sites fabricants
- **Remplissage intelligent** : Champs pré-remplis automatiquement
- **Indicateurs visuels** : Icônes colorées sur champs IA
- **Validation cohérence** : Vérification logique des données
- **Configuration flexible** : Préprompt personnalisable

### 6. **Base de Données** 🗄️
- **Produits** : Informations principales et métadonnées
- **Catégories** : Classification des produits
- **Pièces** : Suivi individuel avec numéros de série
- **Stock** : Historique et raisons des opérations

## 🏗️ STRUCTURE DU PROJET

```
inventory-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Page principale
│   │   ├── layout.tsx               # Layout global
│   │   └── globals.css              # Styles globaux
│   ├── components/
│   │   ├── ui/                      # Composants Shadcn/ui
│   │   ├── inventory/
│   │   │   ├── ProductCard.tsx      # Vue grille des produits
│   │   │   ├── ProductListItem.tsx  # Vue liste des produits
│   │   │   └── ProductForm.tsx      # Formulaire produit
│   │   └── scanner/
│   │       └── BarcodeScanner.tsx   # Scanner codes-barres
│   ├── lib/
│   │   ├── supabase.ts             # Configuration Supabase
│   │   ├── services.ts             # Services métier
│   │   └── version.ts               # Gestion des versions
│   └── types/                      # Types TypeScript
├── docs/                           # Documentation
├── scripts/                        # Scripts utilitaires
├── CHANGELOG.md                    # Historique des versions
├── package.json                    # Dépendances et scripts
└── README.md                       # Instructions d'installation
```

## 🗄️ SCHÉMA DE BASE DE DONNÉES

### Table `products`
```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text,                    -- Code-barres (nullable)
  name text NOT NULL,              -- Nom du produit (obligatoire)
  manufacturer text,               -- Fabricant
  internal_ref text,               -- Référence interne (obligatoire)
  quantity integer DEFAULT 0,      -- Quantité en stock
  category_id uuid REFERENCES categories(id),
  image_url text,                  -- URL de l'image
  notes text,                      -- Notes libres
  metadata jsonb DEFAULT '{}',    -- Métadonnées JSON
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Table `categories`
```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
```

### Table `pieces`
```sql
CREATE TABLE pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  serial_number text NOT NULL UNIQUE,
  barcode text,
  purchase_date date,
  condition text DEFAULT 'new',
  warranty_expires date,
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Tables de gestion de stock
```sql
-- Historique des opérations de stock
CREATE TABLE stock_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id),
  operation_type text NOT NULL, -- 'add', 'remove', 'set'
  quantity_change integer NOT NULL,
  quantity_before integer NOT NULL,
  quantity_after integer NOT NULL,
  reason text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Raisons prédéfinies pour les opérations
CREATE TABLE stock_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL,
  reason_code text NOT NULL UNIQUE,
  reason_label text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true
);
```

## 🔧 CONFIGURATION ET INSTALLATION

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase
- Compte Vercel (optionnel pour déploiement)

### Installation
```bash
# 1. Cloner le projet
git clone https://github.com/exabird/inventory-manager.git
cd inventory-manager

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# 4. Démarrer le serveur de développement
npm run dev
```

### Variables d'environnement
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel (pour déploiement)
VERCEL_PROJECT_ID=your-project-id
```

## 🚀 DÉPLOIEMENT

### Déploiement automatique (Vercel)
1. **Connecter GitHub** à Vercel
2. **Configurer les variables d'environnement** dans Vercel
3. **Push sur main** → Déploiement automatique

### Déploiement manuel
```bash
# 1. Build de production
npm run build

# 2. Déploiement Vercel
npx vercel --prod
```

## 📱 UTILISATION

### 1. **Ajouter un produit**
- **Via scanner** : Bouton caméra → Scan → Formulaire pré-rempli
- **Via saisie** : Bouton + → Formulaire vide
- **Champs obligatoires** : Nom + Référence interne

### 2. **Gérer le stock**
- **Vue liste** : Boutons +/- directement dans la liste
- **Vue grille** : Contrôles dans chaque carte
- **Statuts** : Vert (≥5), Orange (1-4), Rouge (0)

### 3. **Rechercher et filtrer**
- **Recherche** : Barre de recherche en haut
- **Filtres** : Boutons de statut de stock
- **Vue** : Basculement liste/grille

### 4. **Éditer un produit**
- **Clic sur l'icône édition** dans la liste/grille
- **Modification** des informations
- **Sauvegarde** avec validation

## 🔍 DÉBOGAGE ET MAINTENANCE

### Logs et monitoring
```bash
# Logs de développement
npm run logs

# Logs d'erreur uniquement
npm run logs:error

# Vérification de compilation
npm run build:check
```

### Erreurs courantes
1. **Erreur de contrainte NOT NULL** : Vérifier les champs obligatoires
2. **Erreur UUID** : Vérifier le format des IDs
3. **Erreur de caméra** : Vérifier les permissions HTTPS
4. **Erreur Supabase** : Vérifier les clés d'API

### Maintenance de la base de données
```sql
-- Vérifier les contraintes
SELECT * FROM information_schema.table_constraints 
WHERE table_name = 'products';

-- Vérifier les données
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM pieces;
```

## 🛠️ DÉVELOPPEMENT

### Scripts disponibles
```bash
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run build:check      # Vérification du build
npm run lint             # Vérification du code
npm run lint:fix         # Correction automatique
npm run version:patch    # Version patch (0.0.X)
npm run version:minor    # Version minor (0.X.0)
npm run version:major    # Version major (X.0.0)
```

### Ajout de nouvelles fonctionnalités
1. **Planifier** les modifications
2. **Créer** les composants/services
3. **Tester** en local
4. **Mettre à jour** la version
5. **Committer** et déployer

### Conventions de code
- **TypeScript** : Types stricts obligatoires
- **Composants** : Fonctionnels avec hooks
- **Styling** : Tailwind CSS + Shadcn/ui
- **Nommage** : camelCase pour variables, PascalCase pour composants
- **Commentaires** : En français pour la logique métier

## 🔮 ROADMAP FUTURE

### Version 0.1.0 (Beta Stable)
- [ ] Interface de gestion des pièces
- [ ] Amélioration de la gestion des catégories
- [ ] Export/Import des données

### Version 0.2.0
- [ ] Intégration IA (Claude API)
- [ ] Scraping automatique des métadonnées
- [ ] Suggestions intelligentes

### Version 0.3.0
- [ ] APIs externes (Open Food Facts, UPC Database)
- [ ] Synchronisation multi-sources
- [ ] Cache intelligent

### Version 0.4.0
- [ ] Application mobile native
- [ ] Mode hors-ligne
- [ ] Synchronisation cloud

## 📞 SUPPORT ET CONTACT

### En cas de problème
1. **Vérifier les logs** (navigateur, Supabase, Vercel)
2. **Consulter cette documentation**
3. **Vérifier le CHANGELOG** pour les dernières modifications
4. **Tester en local** pour reproduire le problème

### Informations de debug
- **Version actuelle** : Voir dans l'en-tête de l'application
- **Logs Supabase** : Via MCP Supabase
- **Logs Vercel** : Via MCP Vercel
- **Logs navigateur** : Console développeur

---

**📝 Cette documentation doit être mise à jour à chaque modification majeure de l'application.**
