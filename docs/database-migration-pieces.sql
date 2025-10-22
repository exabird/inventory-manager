-- Migration: Ajout de la table "pieces" pour le suivi des garanties
-- Date: 2025-10-22
-- Description: Permet de suivre individuellement chaque boîte/pièce avec son numéro de série

-- Créer la table pieces
CREATE TABLE IF NOT EXISTS public.pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL, -- Numéro de série unique de la pièce
  barcode TEXT, -- Code-barres du numéro de série (si différent du produit)
  purchase_date DATE, -- Date d'achat
  purchase_price DECIMAL(10, 2), -- Prix d'achat
  condition TEXT DEFAULT 'new', -- État: new, used, refurbished, damaged
  warranty_expires DATE, -- Date d'expiration de la garantie
  location TEXT, -- Emplacement physique de la pièce
  notes TEXT, -- Notes spécifiques à cette pièce
  metadata JSONB DEFAULT '{}', -- Métadonnées supplémentaires
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index pour recherche rapide
  CONSTRAINT pieces_product_serial_unique UNIQUE(product_id, serial_number)
);

-- Index pour recherche par produit
CREATE INDEX IF NOT EXISTS idx_pieces_product_id ON public.pieces(product_id);

-- Index pour recherche par numéro de série
CREATE INDEX IF NOT EXISTS idx_pieces_serial_number ON public.pieces(serial_number);

-- Index pour recherche par code-barres
CREATE INDEX IF NOT EXISTS idx_pieces_barcode ON public.pieces(barcode);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_pieces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_pieces_updated_at ON public.pieces;
CREATE TRIGGER update_pieces_updated_at
  BEFORE UPDATE ON public.pieces
  FOR EACH ROW
  EXECUTE FUNCTION update_pieces_updated_at();

-- RLS (Row Level Security) - Activer RLS
ALTER TABLE public.pieces ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Lecture publique
DROP POLICY IF EXISTS "Lecture publique des pièces" ON public.pieces;
CREATE POLICY "Lecture publique des pièces" 
  ON public.pieces 
  FOR SELECT 
  USING (true);

-- Politique RLS: Insertion publique
DROP POLICY IF EXISTS "Insertion publique des pièces" ON public.pieces;
CREATE POLICY "Insertion publique des pièces" 
  ON public.pieces 
  FOR INSERT 
  WITH CHECK (true);

-- Politique RLS: Mise à jour publique
DROP POLICY IF EXISTS "Mise à jour publique des pièces" ON public.pieces;
CREATE POLICY "Mise à jour publique des pièces" 
  ON public.pieces 
  FOR UPDATE 
  USING (true);

-- Politique RLS: Suppression publique
DROP POLICY IF EXISTS "Suppression publique des pièces" ON public.pieces;
CREATE POLICY "Suppression publique des pièces" 
  ON public.pieces 
  FOR DELETE 
  USING (true);

-- Commentaires
COMMENT ON TABLE public.pieces IS 'Table pour suivre individuellement chaque pièce/boîte avec son numéro de série pour la gestion des garanties';
COMMENT ON COLUMN public.pieces.serial_number IS 'Numéro de série unique de la pièce (provenant du code-barres secondaire)';
COMMENT ON COLUMN public.pieces.condition IS 'État de la pièce: new, used, refurbished, damaged';
COMMENT ON COLUMN public.pieces.warranty_expires IS 'Date d''expiration de la garantie calculée automatiquement';

