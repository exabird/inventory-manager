import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client public (côté client et serveur)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin (côté serveur uniquement)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Types pour la base de données
export interface Product {
  id: string;
  barcode: string;
  name: string;
  manufacturer: string | null;
  internal_ref: string | null;
  quantity: number;
  notes: string | null;
  category_id: string | null;
  image_url: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
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

