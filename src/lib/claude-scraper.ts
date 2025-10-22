import Anthropic from '@anthropic-ai/sdk';

// Initialiser Claude avec la clé API
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface EnrichedProductData {
  name?: string;
  manufacturer?: string;
  category?: string;
  image_url?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Enrichir un produit avec Claude AI
 * Utilise Claude pour rechercher des informations sur le produit via le web
 */
export async function enrichProductWithClaude(
  barcode: string, 
  existingData?: EnrichedProductData
): Promise<EnrichedProductData | null> {
  try {
    console.log(`🤖 Enrichissement avec Claude AI pour le code: ${barcode}`);
    
    const prompt = `Tu es un assistant spécialisé dans la recherche de produits commerciaux.

Code-barres: ${barcode}
${existingData ? `Données existantes: ${JSON.stringify(existingData, null, 2)}` : ''}

Recherche ce produit sur internet et retourne un JSON valide avec les informations suivantes:
- name: nom complet du produit (obligatoire)
- manufacturer: fabricant/marque principal
- category: catégorie principale du produit
- image_url: URL d'une image du produit (si trouvée)
- description: description courte du produit
- metadata: objet avec autres infos pertinentes (prix indicatif, dimensions, poids, etc.)

IMPORTANT:
- Retourne UNIQUEMENT le JSON, sans texte supplémentaire
- Si tu ne trouves pas d'informations, retourne null pour chaque champ
- Assure-toi que le JSON est valide
- Priorise les informations officielles du fabricant
- Pour les catégories, utilise des termes génériques (ex: "Électronique", "Alimentaire", "Textile")

Exemple de format attendu:
{
  "name": "iPhone 15 Pro",
  "manufacturer": "Apple",
  "category": "Électronique",
  "image_url": "https://example.com/image.jpg",
  "description": "Smartphone haut de gamme avec caméra professionnelle",
  "metadata": {
    "price_range": "1000-1200 EUR",
    "weight": "187g",
    "dimensions": "146.6 x 70.6 x 8.25 mm",
    "colors": ["Titane naturel", "Titane bleu", "Titane blanc", "Titane noir"]
  }
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const text = content.text.trim();
      
      // Extraire le JSON de la réponse
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const enrichedData = JSON.parse(jsonMatch[0]);
          
          // Valider que nous avons au moins un nom
          if (enrichedData.name && enrichedData.name.trim().length > 0) {
            console.log('✅ Données enrichies par Claude:', enrichedData.name);
            return enrichedData;
          } else {
            console.log('❌ Claude n\'a pas trouvé de nom de produit valide');
            return null;
          }
        } catch (parseError) {
          console.error('❌ Erreur de parsing JSON de Claude:', parseError);
          console.log('Réponse brute:', text);
          return null;
        }
      } else {
        console.log('❌ Aucun JSON trouvé dans la réponse de Claude');
        console.log('Réponse brute:', text);
        return null;
      }
    }

    console.log('❌ Réponse Claude invalide');
    return null;
  } catch (error) {
    console.error('❌ Erreur Claude API:', error);
    return null;
  }
}

/**
 * Enrichir un produit avec des suggestions de catégories intelligentes
 */
export async function suggestCategories(productName: string): Promise<string[]> {
  try {
    const prompt = `Analyse ce nom de produit et suggère 3-5 catégories appropriées en français:

Produit: "${productName}"

Retourne un JSON avec un tableau de catégories:
{
  "categories": ["Catégorie 1", "Catégorie 2", "Catégorie 3"]
}

Utilise des catégories génériques comme:
- Électronique
- Alimentaire
- Textile
- Outillage
- Papeterie
- Beauté & Santé
- Maison & Jardin
- Sport & Loisirs
- Livres & Médias
- Automobile
- etc.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[0]);
          return result.categories || [];
        } catch (parseError) {
          console.error('Erreur de parsing des catégories:', parseError);
        }
      }
    }

    return [];
  } catch (error) {
    console.error('Erreur suggestion catégories:', error);
    return [];
  }
}

/**
 * Vérifier si Claude API est configuré
 */
export function isClaudeConfigured(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY && 
           process.env.ANTHROPIC_API_KEY !== 'placeholder_anthropic_key' &&
           process.env.ANTHROPIC_API_KEY.length > 20);
}
