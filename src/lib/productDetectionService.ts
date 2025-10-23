/**
 * Service pour la détection automatique des informations produit
 * 
 * FONCTION 1 : Scan code-barres → Barcode Lookup API
 * - Remplir les champs de base (nom, marque, etc.)
 * - UNIQUEMENT si les champs sont vides
 * - Ne JAMAIS écraser les données existantes
 * 
 * FONCTION 2 : Bouton IA → Claude (à implémenter)
 * - Recherche avancée sur site marque
 * - Remplissage complet via IA
 */

export interface ProductInfo {
  name?: string;
  brand?: string;
  manufacturer?: string;
  description?: string;
  category?: string;
  price?: number;
  image?: string;
}

export class ProductDetectionService {
  /**
   * FONCTION 1 : Détection basique via Barcode Lookup API
   * Appelé automatiquement après le scan du code-barres
   */
  static async detectProductInfo(barcode: string): Promise<ProductInfo> {
    console.log('🔍 [Fonction 1] Détection basique pour:', barcode);
    
    const apiKey = process.env.NEXT_PUBLIC_BARCODE_LOOKUP_API_KEY;
    
    // Si pas de clé API, retourner des données vides
    if (!apiKey || apiKey === 'your_barcode_lookup_key_here') {
      console.warn('⚠️ [Fonction 1] Pas de clé API Barcode Lookup configurée');
      console.warn('⚠️ Obtenir une clé sur : https://www.barcodelookup.com/api');
      return {
        name: '',
        brand: '',
        manufacturer: '',
        description: '',
        category: '',
        price: undefined,
        image: ''
      };
    }
    
    try {
      console.log('📡 [Fonction 1] Appel Barcode Lookup API...');
      
      const response = await fetch(
        `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ [Fonction 1] Réponse API:', data);
      
      // Extraire les données du premier produit trouvé
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        
        const productInfo: ProductInfo = {
          name: product.title || product.product_name || '',
          brand: product.brand || '',
          manufacturer: product.manufacturer || '',
          description: product.description || '',
          category: product.category || '',
          price: undefined, // On ne prend pas le prix de l'API (peut être obsolète)
          image: product.images && product.images.length > 0 ? product.images[0] : ''
        };
        
        console.log('✅ [Fonction 1] Données extraites:', productInfo);
        return productInfo;
      } else {
        console.warn('⚠️ [Fonction 1] Aucun produit trouvé pour ce code-barres');
        return {
          name: '',
          brand: '',
          manufacturer: '',
          description: '',
          category: '',
          price: undefined,
          image: ''
        };
      }
      
    } catch (error) {
      console.error('❌ [Fonction 1] Erreur API:', error);
      return {
        name: '',
        brand: '',
        manufacturer: '',
        description: '',
        category: '',
        price: undefined,
        image: ''
      };
    }
  }
  
  /**
   * Détecte les informations à partir d'une image
   * Utilise l'OCR et la reconnaissance d'images
   */
  static async detectFromImage(imageFile: File): Promise<ProductInfo> {
    console.log('📸 Détection automatique depuis l\'image:', imageFile.name);
    
    // Simulation d'un délai de traitement d'image
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Dans une vraie implémentation, cela utiliserait:
    // - Google Vision API pour l'OCR
    // - TensorFlow.js pour la reconnaissance d'objets
    // - APIs de reconnaissance de texte
    
    return {
      name: 'Produit détecté depuis l\'image',
      brand: 'Marque détectée',
      manufacturer: 'Fabricant détecté',
      description: 'Description extraite de l\'image',
      category: 'Catégorie détectée',
      price: 99.99
    };
  }
  
  /**
   * Valide et nettoie les données détectées
   */
  static validateDetectedData(data: ProductInfo): ProductInfo {
    return {
      name: data.name?.trim() || '',
      brand: data.brand?.trim() || '',
      manufacturer: data.manufacturer?.trim() || '',
      description: data.description?.trim() || '',
      category: data.category?.trim() || '',
      price: typeof data.price === 'number' ? data.price : 0,
      image: data.image || ''
    };
  }
}
