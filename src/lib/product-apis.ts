import axios from 'axios';

// Interface pour les données enrichies
export interface EnrichedProductData {
  name?: string;
  manufacturer?: string;
  category?: string;
  image_url?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Interface pour la réponse d'enrichissement
export interface EnrichmentResult {
  source: 'openfoodfacts' | 'upcdatabase' | 'claude' | 'manual';
  data: EnrichedProductData;
  success: boolean;
  responseTime: number;
}

/**
 * Open Food Facts API - Pour les produits alimentaires
 * Gratuit et open-source
 */
export async function fetchOpenFoodFacts(barcode: string): Promise<EnrichedProductData | null> {
  try {
    console.log(`🔍 Recherche dans Open Food Facts pour le code: ${barcode}`);
    
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { timeout: 10000 }
    );
    
    if (response.data.status === 1 && response.data.product) {
      const product = response.data.product;
      
      // Extraire les catégories principales
      const categories = product.categories_tags || [];
      const mainCategory = categories.length > 0 ? categories[0].replace(/^fr:/, '').replace(/_/g, ' ') : undefined;
      
      const enrichedData: EnrichedProductData = {
        name: product.product_name || product.product_name_fr,
        manufacturer: product.brands || product.brand_owner,
        category: mainCategory,
        image_url: product.image_url || product.image_front_url,
        description: product.generic_name || product.product_name_fr,
        metadata: {
          nutriscore: product.nutriscore_grade,
          ingredients: product.ingredients_text,
          allergens: product.allergens_tags,
          additives: product.additives_tags,
          packaging: product.packaging_tags,
          countries: product.countries_tags,
          labels: product.labels_tags,
          stores: product.stores_tags,
          categories: categories,
          last_modified: product.last_modified_t,
        },
      };
      
      console.log('✅ Données trouvées dans Open Food Facts:', enrichedData.name);
      return enrichedData;
    }
    
    console.log('❌ Produit non trouvé dans Open Food Facts');
    return null;
  } catch (error) {
    console.error('❌ Erreur Open Food Facts API:', error);
    return null;
  }
}

/**
 * UPC Database API - Pour tous types de produits
 * Limité à 100 requêtes/jour gratuitement
 */
export async function fetchUPCDatabase(barcode: string, apiKey?: string): Promise<EnrichedProductData | null> {
  if (!apiKey) {
    console.log('⚠️ Clé API UPC Database non fournie');
    return null;
  }
  
  try {
    console.log(`🔍 Recherche dans UPC Database pour le code: ${barcode}`);
    
    const response = await axios.get(
      `https://api.upcdatabase.org/product/${barcode}/${apiKey}`,
      { timeout: 10000 }
    );
    
    if (response.data.success && response.data.title) {
      const enrichedData: EnrichedProductData = {
        name: response.data.title,
        manufacturer: response.data.brand,
        category: response.data.category,
        image_url: response.data.image_url,
        description: response.data.description,
        metadata: {
          upc: response.data.upc,
          model: response.data.model,
          color: response.data.color,
          size: response.data.size,
          weight: response.data.weight,
          dimension: response.data.dimension,
          last_updated: response.data.last_updated,
        },
      };
      
      console.log('✅ Données trouvées dans UPC Database:', enrichedData.name);
      return enrichedData;
    }
    
    console.log('❌ Produit non trouvé dans UPC Database');
    return null;
  } catch (error) {
    console.error('❌ Erreur UPC Database API:', error);
    return null;
  }
}

/**
 * Barcode Lookup API - Alternative pour produits généraux
 * 500 requêtes/mois gratuitement
 */
export async function fetchBarcodeLookup(barcode: string, apiKey?: string): Promise<EnrichedProductData | null> {
  if (!apiKey) {
    console.log('⚠️ Clé API Barcode Lookup non fournie');
    return null;
  }
  
  try {
    console.log(`🔍 Recherche dans Barcode Lookup pour le code: ${barcode}`);
    
    const response = await axios.get(
      `https://api.barcodelookup.com/v3/products?barcode=${barcode}&key=${apiKey}`,
      { timeout: 10000 }
    );
    
    if (response.data.products && response.data.products.length > 0) {
      const product = response.data.products[0];
      
      const enrichedData: EnrichedProductData = {
        name: product.title,
        manufacturer: product.brand,
        category: product.category,
        image_url: product.images?.[0],
        description: product.description,
        metadata: {
          upc: product.upc,
          ean: product.ean,
          model: product.model,
          color: product.color,
          size: product.size,
          weight: product.weight,
          dimension: product.dimension,
          price: product.price,
          currency: product.currency,
          availability: product.availability,
          last_updated: product.last_updated,
        },
      };
      
      console.log('✅ Données trouvées dans Barcode Lookup:', enrichedData.name);
      return enrichedData;
    }
    
    console.log('❌ Produit non trouvé dans Barcode Lookup');
    return null;
  } catch (error) {
    console.error('❌ Erreur Barcode Lookup API:', error);
    return null;
  }
}

/**
 * Fonction utilitaire pour nettoyer et normaliser les données
 */
export function normalizeEnrichedData(data: EnrichedProductData): EnrichedProductData {
  return {
    name: data.name?.trim(),
    manufacturer: data.manufacturer?.trim(),
    category: data.category?.trim(),
    image_url: data.image_url?.trim(),
    description: data.description?.trim(),
    metadata: data.metadata || {},
  };
}

/**
 * Fonction utilitaire pour valider les données enrichies
 */
export function validateEnrichedData(data: EnrichedProductData): boolean {
  return !!(data.name && data.name.length > 0);
}
