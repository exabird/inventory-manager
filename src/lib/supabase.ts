import { createClient } from '@supabase/supabase-js';

// Valeurs par défaut pour le développement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nuonbtjrtacfjifnrziv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b25idGpydGFjZmppZm5yeml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODAzNjQsImV4cCI6MjA3NjU1NjM2NH0.WvQNCCfVv9_QBmHlCQZcoq8rnftgL_5stiAzD_Kt8H4';

// Client public (côté client et serveur)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration pour le stockage d'images
export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
} as const;

// Fonction pour obtenir l'URL publique d'une image
export const getImageUrl = (path: string) => {
  const { data } = supabase.storage.from(STORAGE_BUCKETS.PRODUCT_IMAGES).getPublicUrl(path);
  return data.publicUrl;
};

// Client admin (côté serveur uniquement) - seulement si la clé est disponible et valide
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = serviceRoleKey && 
  !serviceRoleKey.includes('placeholder') && 
  serviceRoleKey.length > 50
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

// Types pour la base de données
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
  // Nouveaux champs ajoutés
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


