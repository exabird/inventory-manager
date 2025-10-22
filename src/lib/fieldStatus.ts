import { FieldStatus } from '@/components/ui/FunctionalFields';

// Configuration du statut fonctionnel de chaque champ
export const FIELD_STATUS_CONFIG: Record<string, FieldStatus> = {
  // Champs fonctionnels (sauvegardés en DB)
  name: { functional: true },
  internal_ref: { functional: true },
  quantity: { functional: true },
  barcode: { functional: true },
  manufacturer: { functional: true },
  category_id: { functional: true },
  notes: { functional: true },
  image_url: { functional: true },
  
  // Champs récemment ajoutés (fonctionnels)
  brand: { functional: true },
  manufacturer_ref: { functional: true },
  short_description: { functional: true },
  selling_price_htva: { functional: true },
  purchase_price_htva: { functional: true },
  warranty_period: { functional: true },
  
  // Champs en développement (non fonctionnels)
  metadata: { 
    functional: false, 
    reason: "Structure JSON complexe - en cours d'intégration" 
  },
  
  // Champs métadonnées individuels (non fonctionnels)
  supplier: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  location: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  weight: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  dimensions: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  expiration_date: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  sku: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  tags: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  color: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  material: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  certifications: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  manufacturing_date: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  warranty_duration: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  stock_date: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  website: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  external_links: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  seo_keywords: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  price_history: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  stock_history: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
  internal_notes: { 
    functional: false, 
    reason: "Stocké dans metadata JSON - pas encore intégré individuellement" 
  },
};

// Fonction utilitaire pour obtenir le statut d'un champ
export function getFieldStatus(fieldName: string): FieldStatus {
  return FIELD_STATUS_CONFIG[fieldName] || { functional: true };
}

// Fonction pour vérifier si un champ est fonctionnel
export function isFieldFunctional(fieldName: string): boolean {
  return getFieldStatus(fieldName).functional;
}
