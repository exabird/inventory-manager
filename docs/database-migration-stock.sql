-- =====================================================
-- MIGRATION: Système de gestion de stock
-- Date: 2025-10-22
-- Description: Création des tables pour la gestion avancée du stock
--              avec traçabilité des opérations et raisons prédéfinies
-- =====================================================

-- =====================================================
-- 1. TABLE: stock_operations
-- =====================================================
-- Table pour tracer toutes les opérations de stock
CREATE TABLE IF NOT EXISTS public.stock_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('add', 'remove', 'adjust', 'set')),
  quantity_change INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  user_id UUID, -- Pour une future gestion des utilisateurs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par produit
CREATE INDEX IF NOT EXISTS idx_stock_operations_product_id 
  ON public.stock_operations(product_id);

-- Index pour recherche par type d'opération
CREATE INDEX IF NOT EXISTS idx_stock_operations_type 
  ON public.stock_operations(operation_type);

-- Index pour tri par date
CREATE INDEX IF NOT EXISTS idx_stock_operations_created_at 
  ON public.stock_operations(created_at DESC);

-- =====================================================
-- 2. TABLE: stock_reasons
-- =====================================================
-- Table pour définir les raisons prédéfinies des opérations de stock
CREATE TABLE IF NOT EXISTS public.stock_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL CHECK (operation_type IN ('add', 'remove', 'adjust', 'set')),
  reason_code TEXT NOT NULL UNIQUE,
  reason_label TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par type d'opération
CREATE INDEX IF NOT EXISTS idx_stock_reasons_operation_type 
  ON public.stock_reasons(operation_type);

-- Index pour tri par ordre d'affichage
CREATE INDEX IF NOT EXISTS idx_stock_reasons_order 
  ON public.stock_reasons(operation_type, display_order);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Activer RLS sur les tables
ALTER TABLE public.stock_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reasons ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Lecture publique sur stock_operations
DROP POLICY IF EXISTS "Lecture publique des opérations de stock" ON public.stock_operations;
CREATE POLICY "Lecture publique des opérations de stock" 
  ON public.stock_operations 
  FOR SELECT 
  USING (true);

-- Politique RLS: Insertion publique sur stock_operations
DROP POLICY IF EXISTS "Insertion publique des opérations de stock" ON public.stock_operations;
CREATE POLICY "Insertion publique des opérations de stock" 
  ON public.stock_operations 
  FOR INSERT 
  WITH CHECK (true);

-- Politique RLS: Lecture publique sur stock_reasons
DROP POLICY IF EXISTS "Lecture publique des raisons de stock" ON public.stock_reasons;
CREATE POLICY "Lecture publique des raisons de stock" 
  ON public.stock_reasons 
  FOR SELECT 
  USING (true);

-- Politique RLS: Insertion/Update publique sur stock_reasons (pour l'administration)
DROP POLICY IF EXISTS "Gestion publique des raisons de stock" ON public.stock_reasons;
CREATE POLICY "Gestion publique des raisons de stock" 
  ON public.stock_reasons 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. AJOUT DE COLONNES AUX PRODUITS
-- =====================================================
-- Ajout des colonnes pour gérer le stock minimum requis
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS min_stock_required BOOLEAN DEFAULT false;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS min_stock_quantity INTEGER DEFAULT 0;

-- =====================================================
-- 5. DONNÉES: Raisons pour "Ajouter du stock"
-- =====================================================
INSERT INTO public.stock_reasons (operation_type, reason_code, reason_label, description, display_order) VALUES
  ('add', 'reception_commande', 'Réception commande', 'Réception d''une nouvelle commande fournisseur', 1),
  ('add', 'retour_client', 'Retour client', 'Un client a retourné le produit', 2),
  ('add', 'inventaire_correction_add', 'Correction inventaire', 'Ajustement après comptage physique (ajout)', 3),
  ('add', 'reparation_terminee', 'Réparation terminée', 'Produit réparé et remis en stock', 4),
  ('add', 'stock_promotionnel', 'Stock promotionnel', 'Ajout de stock pour une promotion', 5)
ON CONFLICT (reason_code) DO NOTHING;

-- =====================================================
-- 6. DONNÉES: Raisons pour "Retirer du stock"
-- =====================================================
INSERT INTO public.stock_reasons (operation_type, reason_code, reason_label, description, display_order) VALUES
  ('remove', 'intervention_client', 'Intervention client', 'Utilisation pour intervention chez un client', 1),
  ('remove', 'vente_directe', 'Vente directe', 'Vente directe en magasin ou sur place', 2),
  ('remove', 'casse_defaut', 'Casse/Défaut', 'Produit cassé ou défectueux', 3),
  ('remove', 'expedition', 'Expédition', 'Envoi à un client ou transfert', 4),
  ('remove', 'reparation_envoi', 'Envoi en réparation', 'Produit envoyé pour réparation', 5),
  ('remove', 'usage_interne', 'Usage interne', 'Utilisation interne à l''entreprise', 6),
  ('remove', 'inventaire_correction_remove', 'Correction inventaire', 'Ajustement après comptage physique (retrait)', 7)
ON CONFLICT (reason_code) DO NOTHING;

-- =====================================================
-- 7. DONNÉES: Raisons pour "Corriger le stock"
-- =====================================================
INSERT INTO public.stock_reasons (operation_type, reason_code, reason_label, description, display_order) VALUES
  ('set', 'erreur_comptage', 'Erreur de comptage', 'Correction d''une erreur de comptage', 1),
  ('set', 'reconciliation', 'Réconciliation', 'Mise à jour suite à une réconciliation', 2),
  ('set', 'transfert', 'Transfert', 'Ajustement après transfert entre sites', 3),
  ('set', 'inventaire_complet', 'Inventaire complet', 'Mise à jour suite à un inventaire complet', 4),
  ('set', 'initialisation', 'Initialisation', 'Stock initial du produit', 5)
ON CONFLICT (reason_code) DO NOTHING;

-- =====================================================
-- 8. COMMENTAIRES
-- =====================================================
COMMENT ON TABLE public.stock_operations IS 'Historique de toutes les opérations de stock effectuées';
COMMENT ON TABLE public.stock_reasons IS 'Raisons prédéfinies pour les opérations de stock';

COMMENT ON COLUMN public.stock_operations.operation_type IS 'Type d''opération: add (ajout), remove (retrait), set (définir)';
COMMENT ON COLUMN public.stock_operations.quantity_change IS 'Quantité ajoutée (positif) ou retirée (négatif)';
COMMENT ON COLUMN public.stock_operations.reason IS 'Code de la raison (depuis stock_reasons.reason_code)';

COMMENT ON COLUMN public.stock_reasons.operation_type IS 'Type d''opération auquel cette raison s''applique';
COMMENT ON COLUMN public.stock_reasons.reason_code IS 'Code unique de la raison (utilisé dans stock_operations)';
COMMENT ON COLUMN public.stock_reasons.display_order IS 'Ordre d''affichage dans l''interface (1 = premier)';

COMMENT ON COLUMN public.products.min_stock_required IS 'Indique si un stock minimum est requis pour ce produit';
COMMENT ON COLUMN public.products.min_stock_quantity IS 'Quantité minimum requise en stock';

-- =====================================================
-- 9. VÉRIFICATION
-- =====================================================
-- Afficher le nombre de raisons créées par type
SELECT 
  operation_type,
  COUNT(*) as nombre_raisons
FROM public.stock_reasons
WHERE is_active = true
GROUP BY operation_type
ORDER BY operation_type;

-- Afficher toutes les raisons dans l'ordre
SELECT 
  operation_type,
  display_order,
  reason_code,
  reason_label,
  description
FROM public.stock_reasons
WHERE is_active = true
ORDER BY operation_type, display_order;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

