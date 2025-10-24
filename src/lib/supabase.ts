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

// Types pour les spécifications techniques normalisées
export interface TechnicalSpecifications {
  // Électronique / Informatique
  processor?: string;
  ram_gb?: number;
  storage_gb?: number;
  storage_type?: string;
  graphics_card?: string;
  screen_size_inches?: number;
  resolution?: string;
  refresh_rate_hz?: number;
  panel_type?: string;
  
  // Connectivité
  hdmi_ports?: number;
  displayport_ports?: number;
  usb_ports?: number;
  usb_type_c_ports?: number;
  ethernet_ports?: number;
  ethernet_port?: string;
  audio_jack?: boolean;
  wifi?: string;
  bluetooth?: string;
  nfc?: boolean;
  
  // Alimentation
  power_watts?: number;
  power_output_watts?: number;
  voltage?: string;
  battery_capacity_mah?: number;
  battery_life_hours?: number;
  battery_type?: string;
  charging_port?: string;
  
  // Dimensions
  weight_kg?: number;
  weight_g?: number;
  width_mm?: number;
  height_mm?: number;
  depth_mm?: number;
  dimensions_mm?: { width: number; height: number; depth: number };
  volume_liters?: number;
  
  // Audio
  frequency_response?: string;
  audio_formats?: string;
  audio_inputs?: string;
  voice_assistants?: string;
  
  // Design
  color?: string;
  material?: string;
  finish?: string;
  touch_controls?: string;
  humidity_resistant?: string;
  
  // Performance
  brightness_nits?: number;
  contrast_ratio?: string;
  response_time_ms?: number;
  color_gamut?: string;
  dpi?: number;
  
  // Certifications
  certifications?: string[];
  energy_rating?: string;
  ip_rating?: string;
  
  // Garantie & Compatibilité
  warranty_months?: number;
  warranty_type?: string;
  compatibility?: string[];
  requires_adapter?: boolean;
  
  // Caractéristiques booléennes
  rgb_lighting?: boolean;
  wireless?: boolean;
  rechargeable?: boolean;
  waterproof?: boolean;
  ergonomic?: boolean;
  height_adjustable?: boolean;
  pivot?: boolean;
  tilt?: boolean;
  
  // Système
  operating_system?: string;
  
  // Autres champs flexibles
  [key: string]: string | number | boolean | string[] | Record<string, number> | undefined;
}

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
  brand: string | null; // Deprecated: Utiliser brand_id
  brand_id: string | null; // FK vers brands
  short_description: string | null;
  selling_price_htva: number | null;
  purchase_price_htva: number | null;
  warranty_period: string | null;
  min_stock_required: boolean | null;
  min_stock_quantity: number | null;
  // Description et spécifications techniques
  long_description: string | null;
  technical_specifications: TechnicalSpecifications | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Interface pour les marques
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  // 🤖 Instructions IA pour le fetch
  ai_fetch_prompt: string | null;
  ai_fetch_instructions: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
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


