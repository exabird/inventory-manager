# 🏗️ GUIDE D'ARCHITECTURE - INVENTORY MANAGER

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Structure du projet](#structure-du-projet)
3. [Flux de données](#flux-de-données)
4. [Composants clés](#composants-clés)
5. [Services et API](#services-et-api)
6. [Base de données](#base-de-données)
7. [Conventions et standards](#conventions-et-standards)

---

## 🎯 VUE D'ENSEMBLE

### Technologies principales

| Technologie | Version | Rôle |
|------------|---------|------|
| **Next.js** | 16.0.0 | Framework React avec App Router |
| **React** | 19.2.0 | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |
| **Supabase** | 2.76.1 | Backend (PostgreSQL + Auth + Storage) |
| **Tailwind CSS** | 4.x | Framework CSS utilitaire |
| **Shadcn/ui** | 3.4.2 | Composants UI (Radix UI) |
| **html5-qrcode** | 2.3.8 | Scanner codes-barres |

### Architecture générale

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React Components                      │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Pages (app/)                               │  │  │
│  │  │  - page.tsx (Liste produits)                │  │  │
│  │  │  - dashboard/page.tsx                       │  │  │
│  │  │  - settings/page.tsx                        │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Components (components/)                   │  │  │
│  │  │  - inventory/ (ProductCard, ProductForm...)│  │  │
│  │  │  - scanner/ (BarcodeScanner)               │  │  │
│  │  │  - ui/ (Button, Input, Dialog...)          │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                         ↓                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Services Layer (lib/)                 │  │
│  │  - ProductService                                  │  │
│  │  - CategoryService                                 │  │
│  │  - StockService                                    │  │
│  │  - ImageService                                    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE (Backend)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │         PostgreSQL Database                        │  │
│  │  - products (produits)                            │  │
│  │  - categories (catégories)                        │  │
│  │  - stock_operations (historique stock)           │  │
│  │  - stock_reasons (raisons prédéfinies)           │  │
│  │  - pieces (pièces individuelles)                 │  │
│  │  - product_history (historique actions)          │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Storage Buckets                            │  │
│  │  - product-images (images produits)               │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Row Level Security (RLS)                   │  │
│  │  - Politiques de sécurité par table               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 STRUCTURE DU PROJET

### Arborescence détaillée

```
inventory-app/
├── 📁 src/
│   ├── 📁 app/                        # Pages Next.js (App Router)
│   │   ├── page.tsx                   # Page principale (liste produits)
│   │   ├── layout.tsx                 # Layout global
│   │   ├── globals.css                # Styles globaux
│   │   ├── 📁 dashboard/              # Tableau de bord
│   │   │   └── page.tsx
│   │   ├── 📁 settings/               # Paramètres
│   │   │   └── page.tsx
│   │   └── 📁 api/                    # Routes API Next.js
│   │       ├── 📁 ocr/                # OCR pour images
│   │       │   └── route.ts
│   │       ├── 📁 scrape-page/        # Scraping web
│   │       │   └── route.ts
│   │       └── 📁 test-supabase/      # Tests connexion
│   │           └── route.ts
│   │
│   ├── 📁 components/                 # Composants React
│   │   ├── 📁 inventory/              # Composants gestion stock
│   │   │   ├── CompactProductList.tsx       # Liste compacte produits
│   │   │   ├── CompactProductListItem.tsx   # Item de liste
│   │   │   ├── FilterModal.tsx              # Modale filtres
│   │   │   ├── ProductCard.tsx              # Carte produit (vue grille)
│   │   │   ├── ProductForm.tsx              # Formulaire produit
│   │   │   ├── ProductInspector.tsx         # Inspecteur détails
│   │   │   ├── ProductListItem.tsx          # Item liste (ancien)
│   │   │   ├── ProductThumbnail.tsx         # Vignette image
│   │   │   ├── StockTab.tsx                 # Onglet stock
│   │   │   ├── ImageUploader.tsx            # Upload images (standard)
│   │   │   ├── ImageUploaderCompact.tsx     # Upload compact
│   │   │   └── ImageUploaderSquare.tsx      # Upload carré
│   │   │
│   │   ├── 📁 scanner/                # Scanner codes-barres
│   │   │   └── BarcodeScanner.tsx     # Composant scanner
│   │   │
│   │   ├── 📁 layout/                 # Composants layout
│   │   │   └── Sidebar.tsx            # Barre latérale
│   │   │
│   │   ├── 📁 ui/                     # Composants UI Shadcn
│   │   │   ├── button.tsx             # Bouton
│   │   │   ├── input.tsx              # Champ texte
│   │   │   ├── dialog.tsx             # Dialog/Modal
│   │   │   ├── select.tsx             # Select/Dropdown
│   │   │   ├── switch.tsx             # Switch/Toggle
│   │   │   ├── badge.tsx              # Badge
│   │   │   ├── card.tsx               # Carte
│   │   │   ├── alert.tsx              # Alert
│   │   │   ├── checkbox.tsx           # Checkbox
│   │   │   ├── label.tsx              # Label
│   │   │   ├── textarea.tsx           # Zone de texte
│   │   │   ├── Tabs.tsx               # Onglets
│   │   │   ├── ClientOnly.tsx         # Wrapper client-only
│   │   │   ├── AIFieldIndicator.tsx   # Indicateur champs IA
│   │   │   └── FunctionalFields.tsx   # Champs fonctionnels
│   │   │
│   │   └── 📁 debug/                  # Composants debug (dev only)
│   │       ├── BasicTest.tsx
│   │       ├── ButtonTest.tsx
│   │       ├── DirectSupabaseTest.tsx
│   │       ├── ProductDebug.tsx
│   │       ├── PureReactTest.tsx
│   │       ├── SimpleTest.tsx
│   │       ├── StaticTest.tsx
│   │       └── StorageTest.tsx
│   │
│   └── 📁 lib/                        # Services et utilitaires
│       ├── supabase.ts                # Client Supabase + Types
│       ├── services.ts                # ProductService, CategoryService
│       ├── stockService.ts            # Service gestion stock
│       ├── productImageService.ts     # Service images produits
│       ├── productDetectionService.ts # Service détection IA
│       ├── scrapingService.ts         # Service scraping web
│       ├── fieldStatus.ts             # Statuts champs (IA)
│       ├── utils.ts                   # Utilitaires généraux
│       └── version.ts                 # Version de l'app
│
├── 📁 docs/                           # Documentation
│   ├── APPLICATION_DOCUMENTATION.md   # Doc complète application
│   ├── ARCHITECTURE_GUIDE.md          # Ce fichier
│   ├── DEBUGGING_GUIDE.md             # Guide debugging
│   ├── DEVELOPMENT_PROCESSES.md       # Processus de développement
│   ├── DEPLOYMENT.md                  # Guide de déploiement
│   ├── MONITORING.md                  # Monitoring et logs
│   ├── QUICK_START.md                 # Démarrage rapide
│   ├── SIMPLIFIED_DEVELOPMENT.md      # Développement simplifié
│   ├── PHASE2_AI_INTEGRATION.md       # Phase 2 (IA)
│   ├── PRODUCT_FIELD_TEMPLATE.md      # Template champs produits
│   ├── database-setup.sql             # Script création BDD
│   ├── database-migration-pieces.sql  # Migration pièces
│   └── database-migration-stock.sql   # Migration stock
│
├── 📁 scripts/                        # Scripts utilitaires
│   ├── add-product-field.sh           # Ajouter un champ produit
│   ├── monitor-logs.sh                # Monitoring logs
│   ├── validate-product-fields.sh     # Validation champs
│   └── version-update.sh              # Mise à jour version
│
├── 📁 public/                         # Fichiers statiques
│   └── 📁 assets/
│       ├── 📁 branding/               # Images de marque
│       └── 📁 placeholders/           # Images placeholder
│
├── package.json                       # Dépendances npm
├── tsconfig.json                      # Configuration TypeScript
├── next.config.ts                     # Configuration Next.js
├── tailwind.config.js                 # Configuration Tailwind
├── postcss.config.mjs                 # Configuration PostCSS
├── components.json                    # Configuration Shadcn
├── eslint.config.mjs                  # Configuration ESLint
├── README.md                          # Instructions installation
├── CHANGELOG.md                       # Historique versions
└── .env.local                         # Variables d'environnement (non versionné)
```

### Responsabilités des dossiers

| Dossier | Responsabilité |
|---------|---------------|
| `src/app/` | Pages et routes Next.js (App Router) |
| `src/components/` | Composants React réutilisables |
| `src/lib/` | Services métier, utilitaires, configuration |
| `docs/` | Documentation complète du projet |
| `scripts/` | Scripts bash pour automatisation |
| `public/` | Assets statiques (images, fonts) |

---

## 🔄 FLUX DE DONNÉES

### 1. Chargement des produits

```
┌─────────────────────────────────────────────────────────┐
│  1. Montage du composant Home (page.tsx)                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  2. useEffect() déclenche loadProducts()                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  3. ProductService.getAll()                             │
│     - Appel à Supabase                                  │
│     - SELECT * FROM products                            │
│     - JOIN avec categories                              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  4. Supabase retourne les données                       │
│     - Produits avec catégories                          │
│     - Métadonnées JSONB                                 │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  5. Nettoyage des données                               │
│     - Valeurs null → valeurs par défaut                │
│     - Validation des types                              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  6. Mise à jour de l'état React                         │
│     - setProducts(cleanedProducts)                      │
│     - setIsLoading(false)                               │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  7. Re-render du composant                              │
│     - Affichage de CompactProductList                   │
│     - Affichage des produits dans la liste              │
└─────────────────────────────────────────────────────────┘
```

### 2. Ajout d'un produit

```
┌─────────────────────────────────────────────────────────┐
│  1. Utilisateur remplit le formulaire (ProductForm)    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  2. Validation avec Zod                                 │
│     - Champs obligatoires                               │
│     - Types de données                                  │
│     - Contraintes métier                                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  3. ProductService.create()                             │
│     - Préparation des données                           │
│     - Nettoyage des valeurs                             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  4. Insertion dans Supabase                             │
│     - INSERT INTO products                              │
│     - Retour du produit créé avec ID                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  5. Ajout à l'historique                                │
│     - INSERT INTO product_history                       │
│     - Action: 'added'                                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  6. Rechargement des produits                           │
│     - loadProducts()                                    │
│     - Mise à jour de l'interface                        │
└─────────────────────────────────────────────────────────┘
```

### 3. Modification du stock

```
┌─────────────────────────────────────────────────────────┐
│  1. Utilisateur clique sur +/- (CompactProductListItem)│
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  2. ProductService.updateQuantity(id, +1 ou -1)        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  3. Récupération quantité actuelle                      │
│     - SELECT quantity FROM products WHERE id = ?        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  4. Calcul nouvelle quantité                            │
│     - newQuantity = currentQuantity + change            │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  5. Mise à jour dans Supabase                           │
│     - UPDATE products SET quantity = ? WHERE id = ?     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  6. Ajout à l'historique                                │
│     - INSERT INTO product_history                       │
│     - Action: 'stock_change', quantity_change: +1/-1    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  7. Rechargement automatique (ou mise à jour optimiste)│
└─────────────────────────────────────────────────────────┘
```

### 4. Scanner code-barres

```
┌─────────────────────────────────────────────────────────┐
│  1. Utilisateur clique sur bouton caméra               │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  2. BarcodeScanner demande permissions caméra          │
│     - navigator.mediaDevices.getUserMedia()             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  3. Initialisation html5-qrcode                         │
│     - Démarrage du scanner                              │
│     - Affichage du flux vidéo                           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  4. Détection d'un code                                 │
│     - Callback onScanSuccess(barcode)                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  5. Recherche du produit existant                       │
│     - ProductService.getByBarcode(barcode)              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  6a. Si produit trouvé → Ouvrir inspecteur             │
│  6b. Si non trouvé → Ouvrir formulaire avec barcode    │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 COMPOSANTS CLÉS

### Page principale (src/app/page.tsx)

**Responsabilités :**
- Charger et afficher la liste des produits
- Gérer la recherche et les filtres
- Orchestrer les interactions utilisateur

**État principal :**
```typescript
const [products, setProducts] = useState<Product[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [isLoading, setIsLoading] = useState(true);
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [showInspector, setShowInspector] = useState(false);
```

**Hooks importants :**
```typescript
useEffect(() => {
  loadProducts(); // Chargement initial au montage
}, []);
```

### CompactProductList (src/components/inventory/CompactProductList.tsx)

**Responsabilités :**
- Afficher la liste des produits avec filtres et tri
- Gérer les colonnes visibles/masquées
- Fournir les contrôles de tri et filtrage

**Props :**
```typescript
interface CompactProductListProps {
  products: (Product & { categories?: { name: string } })[];
  onProductSelect: (product: Product) => void;
  onStockEdit: (product: Product) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
```

**État interne :**
```typescript
const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });
const [filterConfig, setFilterConfig] = useState<FilterConfig>({...});
const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({...});
```

### CompactProductListItem (src/components/inventory/CompactProductListItem.tsx)

**Responsabilités :**
- Afficher une ligne de produit dans la liste
- Fournir les contrôles rapides de stock (+/-)
- Gérer le clic pour ouvrir l'inspecteur

**Props :**
```typescript
interface CompactProductListItemProps {
  product: Product & { categories?: { name: string } };
  onSelect: (product: Product) => void;
  onStockEdit: (product: Product) => void;
  columnVisibility: ColumnVisibility;
}
```

### ProductForm (src/components/inventory/ProductForm.tsx)

**Responsabilités :**
- Afficher le formulaire d'ajout/édition de produit
- Gérer la validation avec Zod
- Gérer l'upload d'images
- Intégrer le scraping IA (Phase 2)

**Validation avec Zod :**
```typescript
const productSchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire'),
  internal_ref: z.string().min(1, 'La référence interne est obligatoire'),
  barcode: z.string().nullable(),
  manufacturer: z.string().nullable(),
  // ... autres champs
});
```

### ProductInspector (src/components/inventory/ProductInspector.tsx)

**Responsabilités :**
- Afficher les détails complets d'un produit
- Fournir les actions (éditer, supprimer)
- Afficher l'historique des modifications

### BarcodeScanner (src/components/scanner/BarcodeScanner.tsx)

**Responsabilités :**
- Gérer l'accès à la caméra
- Scanner les codes-barres/QR codes
- Sélectionner le meilleur code si plusieurs détectés
- Gérer les erreurs de caméra

**Configuration scanner :**
```typescript
const config = {
  fps: 10, // Images par seconde
  qrbox: { width: 250, height: 250 }, // Zone de scan
  aspectRatio: 1.0,
  disableFlip: false,
  rememberLastUsedCamera: true,
  supportedScanTypes: [
    Html5QrcodeScanType.SCAN_TYPE_CAMERA
  ]
};
```

---

## 🛠️ SERVICES ET API

### ProductService (src/lib/services.ts)

**Méthodes principales :**

```typescript
export const ProductService = {
  // Récupérer tous les produits avec catégories
  async getAll(): Promise<Product[]>
  
  // Récupérer un produit par code-barres
  async getByBarcode(barcode: string): Promise<Product | null>
  
  // Créer un nouveau produit
  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null>
  
  // Mettre à jour un produit
  async update(id: string, updates: Partial<Product>): Promise<Product | null>
  
  // Mettre à jour la quantité en stock
  async updateQuantity(id: string, quantityChange: number): Promise<boolean>
  
  // Supprimer un produit
  async delete(id: string): Promise<boolean>
  
  // Rechercher des produits
  async search(query: string): Promise<Product[]>
  
  // Ajouter à l'historique
  async addHistory(productId: string, action: string, quantityChange?: number, notes?: string): Promise<void>
};
```

### CategoryService (src/lib/services.ts)

**Méthodes principales :**

```typescript
export const CategoryService = {
  // Récupérer toutes les catégories
  async getAll(): Promise<Category[]>
  
  // Créer une nouvelle catégorie
  async create(name: string, description?: string): Promise<Category | null>
};
```

### StockService (src/lib/stockService.ts)

**Méthodes principales :**

```typescript
export const StockService = {
  // Opération de stock (add, remove, set)
  async performStockOperation(productId: string, operation: StockOperation): Promise<boolean>
  
  // Récupérer l'historique des opérations
  async getOperationHistory(productId: string): Promise<StockOperation[]>
  
  // Récupérer les raisons prédéfinies
  async getReasons(operationType: string): Promise<StockReason[]>
};
```

### Supabase Client (src/lib/supabase.ts)

**Configuration :**

```typescript
// Client public (côté client et serveur)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin (côté serveur uniquement)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Configuration pour le stockage d'images
export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
};

// Fonction pour obtenir l'URL publique d'une image
export const getImageUrl = (path: string) => {
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
    .getPublicUrl(path);
  return data.publicUrl;
};
```

**Types principaux :**

```typescript
export interface Product {
  id: string;
  barcode: string | null;
  name: string;
  manufacturer: string | null;
  internal_ref: string | null;
  quantity: number;
  notes: string | null;
  category_id: string | null;
  image_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Nouveaux champs
  manufacturer_ref: string | null;
  brand: string | null;
  short_description: string | null;
  selling_price_htva: number | null;
  purchase_price_htva: number | null;
  warranty_period: string | null;
  min_stock_required: boolean | null;
  min_stock_quantity: number | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ProductHistory {
  id: string;
  product_id: string;
  action: 'added' | 'updated' | 'deleted' | 'stock_change';
  quantity_change: number | null;
  user_id: string | null;
  notes: string | null;
  created_at: string;
}
```

---

## 🗄️ BASE DE DONNÉES

### Schéma complet

#### Table `products`

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT,                           -- Code-barres (nullable)
  name TEXT NOT NULL,                     -- Nom du produit (obligatoire)
  manufacturer TEXT,                      -- Fabricant
  internal_ref TEXT,                      -- Référence interne
  quantity INTEGER DEFAULT 0,             -- Quantité en stock
  category_id UUID REFERENCES categories(id),
  image_url TEXT,                         -- URL de l'image
  notes TEXT,                             -- Notes libres
  metadata JSONB DEFAULT '{}',            -- Métadonnées JSON
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Nouveaux champs
  manufacturer_ref TEXT,                  -- Référence fabricant
  brand TEXT,                             -- Marque
  short_description TEXT,                 -- Description courte
  selling_price_htva NUMERIC(10,2),       -- Prix de vente HT
  purchase_price_htva NUMERIC(10,2),      -- Prix d'achat HT
  warranty_period TEXT,                   -- Période de garantie
  min_stock_required BOOLEAN DEFAULT FALSE, -- Stock min requis
  min_stock_quantity INTEGER DEFAULT 0    -- Quantité de stock min
);

-- Index pour performance
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_internal_ref ON products(internal_ref);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_manufacturer_ref ON products(manufacturer_ref);
```

#### Table `categories`

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,              -- Nom de la catégorie
  description TEXT,                       -- Description
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Table `product_history`

```sql
CREATE TABLE product_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  action TEXT NOT NULL,                   -- 'added', 'updated', 'deleted', 'stock_change'
  quantity_change INTEGER,                -- Changement de quantité (si applicable)
  user_id UUID,                           -- Utilisateur (si Auth activée)
  notes TEXT,                             -- Notes sur l'action
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_history_product ON product_history(product_id);
CREATE INDEX idx_history_created ON product_history(created_at DESC);
```

#### Table `stock_operations`

```sql
CREATE TABLE stock_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,           -- 'add', 'remove', 'set'
  quantity_change INTEGER NOT NULL,       -- Changement de quantité
  quantity_before INTEGER NOT NULL,       -- Quantité avant opération
  quantity_after INTEGER NOT NULL,        -- Quantité après opération
  reason TEXT NOT NULL,                   -- Raison de l'opération
  notes TEXT,                             -- Notes additionnelles
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_ops_product ON stock_operations(product_id);
CREATE INDEX idx_stock_ops_created ON stock_operations(created_at DESC);
```

#### Table `stock_reasons`

```sql
CREATE TABLE stock_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL,           -- 'add', 'remove', 'set'
  reason_code TEXT NOT NULL UNIQUE,       -- Code unique de la raison
  reason_label TEXT NOT NULL,             -- Label affiché
  display_order INTEGER DEFAULT 0,        -- Ordre d'affichage
  is_active BOOLEAN DEFAULT TRUE          -- Raison active
);

-- Raisons prédéfinies pour ajout de stock
INSERT INTO stock_reasons (operation_type, reason_code, reason_label, display_order) VALUES
('add', 'purchase', 'Achat / Réception', 1),
('add', 'return', 'Retour client', 2),
('add', 'production', 'Production interne', 3),
('add', 'adjustment', 'Ajustement inventaire', 4),
('add', 'transfer_in', 'Transfert entrant', 5),
('add', 'other', 'Autre', 99);

-- Raisons prédéfinies pour retrait de stock
INSERT INTO stock_reasons (operation_type, reason_code, reason_label, display_order) VALUES
('remove', 'sale', 'Vente', 1),
('remove', 'damage', 'Dommage / Casse', 2),
('remove', 'lost', 'Perte', 3),
('remove', 'expired', 'Périmé', 4),
('remove', 'return_supplier', 'Retour fournisseur', 5),
('remove', 'internal_use', 'Usage interne', 6),
('remove', 'transfer_out', 'Transfert sortant', 7),
('remove', 'theft', 'Vol', 8),
('remove', 'other', 'Autre', 99);

-- Raisons prédéfinies pour correction de stock
INSERT INTO stock_reasons (operation_type, reason_code, reason_label, display_order) VALUES
('set', 'inventory', 'Inventaire physique', 1),
('set', 'correction', 'Correction erreur', 2),
('set', 'migration', 'Migration données', 3),
('set', 'other', 'Autre', 99);
```

#### Table `pieces`

```sql
CREATE TABLE pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL UNIQUE,     -- Numéro de série
  barcode TEXT,                           -- Code-barres individuel
  purchase_date DATE,                     -- Date d'achat
  condition TEXT DEFAULT 'new',           -- État ('new', 'used', 'refurbished')
  warranty_expires DATE,                  -- Date d'expiration garantie
  location TEXT,                          -- Emplacement physique
  notes TEXT,                             -- Notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pieces_product ON pieces(product_id);
CREATE INDEX idx_pieces_serial ON pieces(serial_number);
CREATE INDEX idx_pieces_barcode ON pieces(barcode);
```

### Row Level Security (RLS)

**Activation RLS sur toutes les tables :**

```sql
-- Activer RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;

-- Politique pour accès public (à ajuster selon Auth)
CREATE POLICY "Accès public" ON products FOR ALL USING (true);
CREATE POLICY "Accès public" ON categories FOR ALL USING (true);
CREATE POLICY "Accès public" ON product_history FOR ALL USING (true);
CREATE POLICY "Accès public" ON stock_operations FOR ALL USING (true);
CREATE POLICY "Accès public" ON stock_reasons FOR ALL USING (true);
CREATE POLICY "Accès public" ON pieces FOR ALL USING (true);
```

**Note :** Ces politiques doivent être affinées lorsque l'authentification sera activée.

---

## 📜 CONVENTIONS ET STANDARDS

### TypeScript

#### Typage strict obligatoire

```typescript
// ✅ BON : Types explicites
interface ProductFormData {
  name: string;
  barcode: string | null;
  quantity: number;
}

// ❌ MAUVAIS : Types implicites any
const handleSubmit = (data) => { /* ... */ }
```

#### Null vs Undefined

```typescript
// ✅ Utiliser null pour les valeurs optionnelles en BDD
interface Product {
  barcode: string | null; // Peut être null en BDD
  quantity: number;        // Jamais null
}

// ✅ Utiliser undefined pour les valeurs optionnelles en UI
interface ComponentProps {
  onClose?: () => void; // Optionnel (undefined si non fourni)
}
```

### Composants React

#### Composants fonctionnels avec hooks

```typescript
// ✅ BON : Composant fonctionnel avec TypeScript
interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
}

export default function ProductCard({ product, onEdit }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div onMouseEnter={() => setIsHovered(true)}>
      {/* ... */}
    </div>
  );
}

// ❌ MAUVAIS : Composant classe (éviter)
class ProductCard extends React.Component { /* ... */ }
```

#### Ordre des hooks

```typescript
export default function MyComponent() {
  // 1. États
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Effets
  useEffect(() => {
    loadData();
  }, []);
  
  // 3. Callbacks
  const handleClick = useCallback(() => {
    /* ... */
  }, []);
  
  // 4. Render
  return <div>...</div>;
}
```

### Nommage

#### Fichiers et dossiers

```
✅ BON :
- ProductCard.tsx           (composants : PascalCase)
- services.ts               (services : camelCase)
- productService.ts         (services spécifiques : camelCase)
- CompactProductList.tsx    (composants composés : PascalCase)

❌ MAUVAIS :
- product-card.tsx          (kebab-case)
- ProductService.ts         (service avec PascalCase)
```

#### Variables et fonctions

```typescript
// ✅ Variables : camelCase
const productList = [];
const isLoading = false;

// ✅ Constantes : UPPER_SNAKE_CASE
const MAX_PRODUCTS = 100;
const API_BASE_URL = 'https://api.example.com';

// ✅ Fonctions : camelCase avec verbe
function loadProducts() { /* ... */ }
function handleSubmit() { /* ... */ }
async function fetchData() { /* ... */ }

// ✅ Types/Interfaces : PascalCase
interface Product { /* ... */ }
type ProductStatus = 'active' | 'inactive';
```

### Styles Tailwind

#### Ordre des classes

```tsx
// ✅ BON : Layout → Spacing → Sizing → Typography → Visual → States
<div className="flex items-center gap-4 p-4 w-full h-12 text-sm font-medium bg-white border rounded-lg hover:bg-gray-50">
  {/* ... */}
</div>

// Organisation :
// 1. Layout (flex, grid, block...)
// 2. Spacing (p-, m-, gap-)
// 3. Sizing (w-, h-, min-, max-)
// 4. Typography (text-, font-)
// 5. Visual (bg-, border-, shadow-)
// 6. States (hover:, focus:, active:)
```

#### Responsive design

```tsx
// ✅ Mobile-first approach
<div className="
  w-full           // Mobile par défaut
  md:w-1/2         // Tablette
  lg:w-1/3         // Desktop
">
  {/* ... */}
</div>
```

### Gestion des erreurs

#### Try-catch avec logs détaillés

```typescript
// ✅ BON : Gestion d'erreur complète
async create(product: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    console.log('➕ [ProductService.create] Données:', product);
    
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ [ProductService.create] Produit créé:', data);
    return data;
    
  } catch (error: any) {
    console.error('❌ [ProductService.create] Erreur:', error);
    console.error('❌ Code:', error.code);
    console.error('❌ Message:', error.message);
    return null;
  }
}

// ❌ MAUVAIS : Pas de gestion d'erreur
async create(product: Omit<Product, 'id'>): Promise<Product | null> {
  const { data } = await supabase.from('products').insert([product]);
  return data;
}
```

### Commentaires de code

```typescript
// ✅ BON : Commentaires en français, descriptifs
// Nettoyer les données pour éviter les erreurs de rendu
const cleanedProducts = products.map(product => ({
  ...product,
  barcode: product.barcode || '',
  quantity: product.quantity || 0
}));

// ✅ BON : Doc function avec exemples
/**
 * Récupère tous les produits avec leurs catégories
 * @returns Promise<Product[]> - Liste des produits avec catégories jointes
 * @throws Erreur Supabase si problème de connexion
 * 
 * @example
 * const products = await ProductService.getAll();
 * console.log(products[0].categories?.name);
 */
async getAll(): Promise<Product[]> {
  // ...
}

// ❌ MAUVAIS : Commentaires inutiles
// Set loading to true
setIsLoading(true);

// ❌ MAUVAIS : Commentaires en anglais (préférer français)
// Fetch all products from database
```

### Logs structurés

```typescript
// ✅ BON : Logs avec emojis et contexte
console.log('📦 [ProductService.getAll] Début requête');
console.log('✅ [ProductService.getAll] Succès:', data.length, 'produits');
console.error('❌ [ProductService.getAll] Erreur:', error);
console.warn('⚠️ [ProductService.getAll] Warning:', warning);
console.log('🔍 [ProductService.getAll] Debug:', debugInfo);

// Emojis standards :
// 📦 = Chargement/requête
// ✅ = Succès
// ❌ = Erreur
// ⚠️ = Warning
// 🔍 = Debug
// 🔄 = Process/traitement
// 📊 = Données/résultats
// ➕ = Création
// ✏️ = Modification
// 🗑️ = Suppression
```

---

## 🎯 BONNES PRATIQUES

### Performance

1. **Memoization** : Utiliser `useMemo` et `useCallback` pour éviter re-renders
2. **Lazy loading** : Charger les composants lourds uniquement si nécessaires
3. **Optimistic updates** : Mettre à jour l'UI avant la confirmation serveur
4. **Debounce** : Pour les recherches et inputs fréquents

### Sécurité

1. **Validation côté serveur** : Ne jamais faire confiance au client
2. **RLS Supabase** : Toujours activer et bien configurer
3. **Variables d'environnement** : Ne jamais committer `.env.local`
4. **Sanitization** : Nettoyer les entrées utilisateur

### Accessibilité

1. **Labels** : Toujours associer labels et inputs
2. **ARIA** : Utiliser les attributs ARIA appropriés
3. **Keyboard navigation** : Tout doit être accessible au clavier
4. **Contrast** : Respecter les ratios de contraste WCAG

---

**📝 Ce guide doit être consulté lors du développement de nouvelles fonctionnalités ou de l'analyse de l'application.**

