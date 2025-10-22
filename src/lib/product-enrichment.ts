import { 
  fetchOpenFoodFacts, 
  fetchUPCDatabase, 
  fetchBarcodeLookup,
  normalizeEnrichedData,
  validateEnrichedData,
  EnrichedProductData,
  EnrichmentResult 
} from './product-apis';
import { 
  enrichProductWithClaude, 
  suggestCategories,
  isClaudeConfigured 
} from './claude-scraper';

/**
 * Service d'enrichissement unifié des produits
 * Essaie plusieurs sources dans l'ordre de priorité
 */
export async function enrichProduct(barcode: string): Promise<EnrichmentResult | null> {
  const startTime = Date.now();
  
  console.log(`🚀 Début de l'enrichissement pour le code: ${barcode}`);
  
  // 1. Essayer Open Food Facts d'abord (gratuit, rapide, fiable)
  console.log('🔍 Étape 1/4: Recherche dans Open Food Facts...');
  let data = await fetchOpenFoodFacts(barcode);
  
  if (data && validateEnrichedData(data)) {
    const enrichedData = normalizeEnrichedData(data);
    const responseTime = Date.now() - startTime;
    
    console.log('✅ Enrichissement réussi via Open Food Facts');
    return {
      source: 'openfoodfacts',
      data: enrichedData,
      success: true,
      responseTime,
    };
  }
  
  // 2. Essayer UPC Database (si clé API disponible)
  console.log('🔍 Étape 2/4: Recherche dans UPC Database...');
  const upcApiKey = process.env.UPC_DATABASE_API_KEY;
  if (upcApiKey && upcApiKey !== 'placeholder_upc_key') {
    data = await fetchUPCDatabase(barcode, upcApiKey);
    
    if (data && validateEnrichedData(data)) {
      const enrichedData = normalizeEnrichedData(data);
      const responseTime = Date.now() - startTime;
      
      console.log('✅ Enrichissement réussi via UPC Database');
      return {
        source: 'upcdatabase',
        data: enrichedData,
        success: true,
        responseTime,
      };
    }
  } else {
    console.log('⚠️ Clé API UPC Database non configurée');
  }
  
  // 3. Essayer Barcode Lookup (si clé API disponible)
  console.log('🔍 Étape 3/4: Recherche dans Barcode Lookup...');
  const barcodeLookupApiKey = process.env.BARCODE_LOOKUP_API_KEY;
  if (barcodeLookupApiKey && barcodeLookupApiKey !== 'placeholder_barcode_key') {
    data = await fetchBarcodeLookup(barcode, barcodeLookupApiKey);
    
    if (data && validateEnrichedData(data)) {
      const enrichedData = normalizeEnrichedData(data);
      const responseTime = Date.now() - startTime;
      
      console.log('✅ Enrichissement réussi via Barcode Lookup');
      return {
        source: 'upcdatabase', // Même type que UPC Database
        data: enrichedData,
        success: true,
        responseTime,
      };
    }
  } else {
    console.log('⚠️ Clé API Barcode Lookup non configurée');
  }
  
  // 4. En dernier recours, utiliser Claude AI
  if (isClaudeConfigured()) {
    console.log('🤖 Étape 4/4: Enrichissement avec Claude AI...');
    data = await enrichProductWithClaude(barcode);
    
    if (data && validateEnrichedData(data)) {
      const enrichedData = normalizeEnrichedData(data);
      const responseTime = Date.now() - startTime;
      
      console.log('✅ Enrichissement réussi via Claude AI');
      return {
        source: 'claude',
        data: enrichedData,
        success: true,
        responseTime,
      };
    }
  } else {
    console.log('⚠️ Claude API non configuré');
  }
  
  // Aucune donnée trouvée
  const responseTime = Date.now() - startTime;
  console.log('❌ Aucune donnée trouvée pour ce code-barres');
  
  return {
    source: 'manual',
    data: {
      name: '',
      manufacturer: '',
      category: '',
      image_url: '',
      description: '',
      metadata: {},
    },
    success: false,
    responseTime,
  };
}

/**
 * Enrichir un produit avec des suggestions de catégories
 */
export async function enrichWithCategorySuggestions(
  productName: string
): Promise<string[]> {
  if (!isClaudeConfigured()) {
    console.log('⚠️ Claude API non configuré pour les suggestions de catégories');
    return [];
  }
  
  try {
    console.log(`🏷️ Génération de suggestions de catégories pour: ${productName}`);
    const categories = await suggestCategories(productName);
    console.log('✅ Suggestions générées:', categories);
    return categories;
  } catch (error) {
    console.error('❌ Erreur lors de la génération des suggestions:', error);
    return [];
  }
}

/**
 * Enrichir un produit existant avec des données partielles
 */
export async function enrichExistingProduct(
  barcode: string,
  existingData: Partial<EnrichedProductData>
): Promise<EnrichmentResult | null> {
  console.log(`🔄 Enrichissement d'un produit existant: ${barcode}`);
  
  // Si on a déjà un nom, essayer de compléter avec Claude
  if (existingData.name && isClaudeConfigured()) {
    console.log('🤖 Complétion avec Claude AI...');
    const data = await enrichProductWithClaude(barcode, existingData as EnrichedProductData);
    
    if (data) {
      // Fusionner les données existantes avec les nouvelles
      const mergedData: EnrichedProductData = {
        ...existingData,
        ...data,
        // Garder les métadonnées existantes et ajouter les nouvelles
        metadata: {
          ...existingData.metadata,
          ...data.metadata,
        },
      };
      
      return {
        source: 'claude',
        data: normalizeEnrichedData(mergedData),
        success: true,
        responseTime: 0,
      };
    }
  }
  
  // Sinon, faire un enrichissement normal
  return await enrichProduct(barcode);
}

/**
 * Vérifier la configuration des APIs
 */
export function getApiStatus() {
  return {
    openFoodFacts: true, // Toujours disponible
    upcDatabase: !!(process.env.UPC_DATABASE_API_KEY && 
                   process.env.UPC_DATABASE_API_KEY !== 'placeholder_upc_key'),
    barcodeLookup: !!(process.env.BARCODE_LOOKUP_API_KEY && 
                     process.env.BARCODE_LOOKUP_API_KEY !== 'placeholder_barcode_key'),
    claude: isClaudeConfigured(),
  };
}

/**
 * Obtenir les statistiques d'enrichissement
 */
export function getEnrichmentStats() {
  return {
    availableSources: Object.values(getApiStatus()).filter(Boolean).length,
    totalSources: 4,
    isFullyConfigured: Object.values(getApiStatus()).every(Boolean),
  };
}
