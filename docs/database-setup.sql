-- =====================================================
-- INVENTORY MANAGER - BASE DE DONNÉES SUPABASE
-- =====================================================
-- Ce script crée toutes les tables nécessaires pour l'application
-- Exécutez ce script dans le SQL Editor de votre projet Supabase

-- =====================================================
-- 1. SUPPRESSION DES TABLES EXISTANTES (si nécessaire)
-- =====================================================
-- Décommentez ces lignes si vous voulez réinitialiser la base
-- DROP TABLE IF EXISTS product_history CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;

-- =====================================================
-- 2. TABLE: categories
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABLE: products
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(500) NOT NULL,
  manufacturer VARCHAR(255),
  internal_ref VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_internal_ref ON products(internal_ref);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Index pour la recherche full-text
CREATE INDEX IF NOT EXISTS idx_products_search ON products 
  USING gin(to_tsvector('french', name || ' ' || COALESCE(manufacturer, '') || ' ' || COALESCE(internal_ref, '')));

-- =====================================================
-- 4. TABLE: product_history
-- =====================================================
CREATE TABLE IF NOT EXISTS product_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('added', 'updated', 'deleted', 'stock_change')),
  quantity_change INTEGER,
  user_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes d'historique
CREATE INDEX IF NOT EXISTS idx_product_history_product ON product_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_history_created ON product_history(created_at DESC);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Activer RLS sur toutes les tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_history ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire (pour commencer)
-- IMPORTANT: Modifier ces politiques selon vos besoins de sécurité
CREATE POLICY "Allow public read access on categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on product_history"
  ON product_history FOR SELECT
  USING (true);

-- Politique: Tout le monde peut créer/modifier/supprimer (pour commencer)
-- IMPORTANT: En production, restreindre aux utilisateurs authentifiés
CREATE POLICY "Allow public insert on categories"
  ON categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on categories"
  ON categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on categories"
  ON categories FOR DELETE
  USING (true);

CREATE POLICY "Allow public insert on products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on products"
  ON products FOR DELETE
  USING (true);

CREATE POLICY "Allow public insert on product_history"
  ON product_history FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 6. FONCTIONS UTILITAIRES
-- =====================================================
-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at sur products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. DONNÉES DE TEST (optionnel)
-- =====================================================
-- Insérer quelques catégories de test
INSERT INTO categories (name, description) VALUES
  ('Électronique', 'Appareils électroniques et accessoires'),
  ('Alimentaire', 'Produits alimentaires et boissons'),
  ('Textile', 'Vêtements et accessoires'),
  ('Outillage', 'Outils et équipements'),
  ('Papeterie', 'Fournitures de bureau')
ON CONFLICT (name) DO NOTHING;

-- Insérer quelques produits de test
INSERT INTO products (barcode, name, manufacturer, quantity, category_id, notes) VALUES
  (
    '1234567890123',
    'Produit Test 1',
    'Fabricant Test',
    10,
    (SELECT id FROM categories WHERE name = 'Électronique' LIMIT 1),
    'Ceci est un produit de test'
  ),
  (
    '9876543210987',
    'Produit Test 2',
    'Autre Fabricant',
    5,
    (SELECT id FROM categories WHERE name = 'Alimentaire' LIMIT 1),
    'Un autre produit de test'
  )
ON CONFLICT (barcode) DO NOTHING;

-- =====================================================
-- 8. VUES UTILES (optionnel)
-- =====================================================
-- Vue pour obtenir les produits avec leurs catégories
CREATE OR REPLACE VIEW products_with_categories AS
SELECT 
  p.*,
  c.name as category_name,
  c.description as category_description
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- Vue pour les statistiques d'inventaire
CREATE OR REPLACE VIEW inventory_stats AS
SELECT 
  COUNT(*) as total_products,
  SUM(quantity) as total_items,
  COUNT(DISTINCT category_id) as total_categories,
  COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock_count,
  COUNT(CASE WHEN quantity < 5 THEN 1 END) as low_stock_count
FROM products;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- Vérifier que tout est créé correctement:
SELECT 
  'Tables créées:' as info,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('categories', 'products', 'product_history');

-- Afficher les catégories
SELECT * FROM categories;

-- Afficher les statistiques
SELECT * FROM inventory_stats;


