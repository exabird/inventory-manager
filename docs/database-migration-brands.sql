-- ============================================
-- MIGRATION : Système de Gestion des Marques
-- Date : 24 octobre 2025
-- Version : 0.1.35
-- ============================================

-- 1. Créer la table brands
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE, -- Pour URL-friendly
  logo_url TEXT,
  description TEXT,
  website VARCHAR(500),
  
  -- 🤖 Prompt IA personnalisé pour le fetch
  ai_fetch_prompt TEXT,
  ai_fetch_instructions JSONB DEFAULT '{}'::jsonb, -- Instructions structurées (optionnel)
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Index pour recherche rapide
CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_brands_slug ON brands(slug);

-- 3. Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_brands_updated_at();

-- 4. Ajouter colonne brand_id à products (FK vers brands)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- 5. Index pour la FK
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);

-- 6. Migrer les données existantes (brand texte → brands table)
-- Créer les marques depuis les valeurs uniques de products.brand
INSERT INTO brands (name, slug)
SELECT DISTINCT 
  brand,
  LOWER(REPLACE(REPLACE(REPLACE(brand, ' ', '-'), '.', ''), '/', '-'))
FROM products
WHERE brand IS NOT NULL AND brand != ''
ON CONFLICT (name) DO NOTHING;

-- 7. Lier les produits aux marques créées
UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE p.brand = b.name
  AND p.brand IS NOT NULL 
  AND p.brand != '';

-- 8. RLS (Row Level Security)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture publique
CREATE POLICY "Brands are viewable by everyone"
  ON brands FOR SELECT
  USING (true);

-- Politique : Modification authentifiée
CREATE POLICY "Brands are modifiable by authenticated users"
  ON brands FOR ALL
  USING (auth.role() = 'authenticated');

-- 9. Commentaires
COMMENT ON TABLE brands IS 'Table des marques de produits avec instructions IA personnalisées';
COMMENT ON COLUMN brands.ai_fetch_prompt IS 'Prompt personnalisé pour guider l''IA lors du fetch (ex: "Chercher sur sonos.com/fr-be/shop/")';
COMMENT ON COLUMN brands.ai_fetch_instructions IS 'Instructions structurées JSON pour le fetch IA (sites alternatifs, patterns URL, etc.)';

-- ============================================
-- EXEMPLES DE DONNÉES
-- ============================================

-- Sonos
INSERT INTO brands (name, slug, website, description, ai_fetch_prompt, logo_url)
VALUES (
  'Sonos',
  'sonos',
  'https://www.sonos.com',
  'Marque américaine de systèmes audio sans fil haut de gamme.',
  'Chercher les informations produit sur https://www.sonos.com/fr-be/shop/. Les images produit sont disponibles en haute résolution. Extraire le nom exact, les spécifications techniques complètes (WiFi, Bluetooth, puissance, dimensions) et toutes les images disponibles.',
  'https://www.sonos.com/on/demandware.static/Sites-Sonos-Site/-/default/dw0e3c3e7a/images/sonos-logo.svg'
) ON CONFLICT (name) DO NOTHING;

-- UniFi (Ubiquiti)
INSERT INTO brands (name, slug, website, description, ai_fetch_prompt, logo_url)
VALUES (
  'UniFi',
  'unifi',
  'https://ui.com',
  'Gamme professionnelle de Ubiquiti Networks pour équipements réseau.',
  'Chercher les informations produit sur https://ui.com ou https://store.ui.com. Les fiches produit contiennent des spécifications techniques détaillées. Extraire tous les détails réseau (ports Ethernet, PoE, débit, WiFi), dimensions, puissance et toutes les images produit.',
  'https://ui.com/assets/favicons/favicon.ico'
) ON CONFLICT (name) DO NOTHING;

-- Apple
INSERT INTO brands (name, slug, website, description, ai_fetch_prompt, logo_url)
VALUES (
  'Apple',
  'apple',
  'https://www.apple.com',
  'Marque technologique américaine (iPhone, iPad, Mac, AirPods).',
  'Chercher sur https://www.apple.com/be/fr/. Les pages produit Apple contiennent des images haute résolution et des spécifications détaillées. Extraire le modèle exact, la capacité de stockage, la couleur, les dimensions, le poids et toutes les images produit.',
  'https://www.apple.com/ac/globalnav/7/en_US/images/be15e3ea-6c42-4f70-ac62-6f8b5b45e5f1/globalnav_apple_image__b5er5ngrzxqq_large.svg'
) ON CONFLICT (name) DO NOTHING;

-- Samsung
INSERT INTO brands (name, slug, website, description, ai_fetch_prompt, logo_url)
VALUES (
  'Samsung',
  'samsung',
  'https://www.samsung.com',
  'Marque coréenne d''électronique grand public et professionnelle.',
  'Chercher sur https://www.samsung.com/be/fr/. Les fiches produit Samsung incluent des spécifications techniques détaillées et de nombreuses images. Extraire le modèle complet, les caractéristiques techniques, dimensions et toutes les images disponibles.',
  'https://images.samsung.com/is/image/samsung/assets/be_fr/about-us/brand/logo/mo/360_197_1.png'
) ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ROLLBACK (si besoin)
-- ============================================

-- Pour annuler cette migration :
-- DROP TABLE IF EXISTS brands CASCADE;
-- ALTER TABLE products DROP COLUMN IF EXISTS brand_id;


