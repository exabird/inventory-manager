import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types pour les données de scraping
export interface ScrapedProductData {
  name: string;
  description?: string;
  manufacturer?: string;
  category?: string;
  barcode?: string;
  price?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  images?: string[];
  specifications?: Record<string, string | number | boolean>;
  confidence: number; // Score de confiance de l'IA (0-100)
}

export interface ScrapingSource {
  type: 'barcode' | 'url' | 'image' | 'manual';
  value: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ScrapingResult {
  success: boolean;
  data?: ScrapedProductData;
  error?: string;
  source: ScrapingSource;
  processingTime: number;
  aiAnalysis?: {
    model: string;
    confidence: number;
    reasoning?: string;
  };
}

// Service de scraping principal
export class ScrapingService {
  private static instance: ScrapingService;
  private claudeApiKey: string;

  constructor() {
    this.claudeApiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '';
    if (!this.claudeApiKey) {
      console.warn('⚠️ Claude API key not found. Scraping will be limited.');
    }
  }

  static getInstance(): ScrapingService {
    if (!ScrapingService.instance) {
      ScrapingService.instance = new ScrapingService();
    }
    return ScrapingService.instance;
  }

  // Scraping par code-barres
  async scrapeByBarcode(barcode: string): Promise<ScrapingResult> {
    const startTime = Date.now();
    
    try {
      // 1. Vérifier d'abord en base de données locale
      const localResult = await this.checkLocalDatabase(barcode);
      if (localResult) {
        return {
          success: true,
          data: localResult,
          source: { type: 'barcode', value: barcode },
          processingTime: Date.now() - startTime,
          aiAnalysis: {
            model: 'local_database',
            confidence: 100
          }
        };
      }

      // 2. Scraping via APIs externes
      const externalData = await this.scrapeExternalAPIs(barcode);
      
      // 3. Analyse IA avec Claude
      const aiAnalysis = await this.analyzeWithClaude(externalData, 'barcode', barcode);
      
      return {
        success: true,
        data: aiAnalysis.data,
        source: { type: 'barcode', value: barcode },
        processingTime: Date.now() - startTime,
        aiAnalysis: {
          model: 'claude-3.5-sonnet',
          confidence: aiAnalysis.confidence,
          reasoning: aiAnalysis.reasoning
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: { type: 'barcode', value: barcode },
        processingTime: Date.now() - startTime
      };
    }
  }

  // Scraping par URL
  async scrapeByURL(url: string): Promise<ScrapingResult> {
    const startTime = Date.now();
    
    try {
      // 1. Scraping du contenu de la page
      const pageContent = await this.scrapeWebPage(url);
      
      // 2. Analyse IA avec Claude
      const aiAnalysis = await this.analyzeWithClaude(pageContent, 'url', url);
      
      return {
        success: true,
        data: aiAnalysis.data,
        source: { type: 'url', value: url },
        processingTime: Date.now() - startTime,
        aiAnalysis: {
          model: 'claude-3.5-sonnet',
          confidence: aiAnalysis.confidence,
          reasoning: aiAnalysis.reasoning
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: { type: 'url', value: url },
        processingTime: Date.now() - startTime
      };
    }
  }

  // Scraping par image (OCR + analyse)
  async scrapeByImage(imageFile: File): Promise<ScrapingResult> {
    const startTime = Date.now();
    
    try {
      // 1. OCR sur l'image
      const ocrText = await this.performOCR(imageFile);
      
      // 2. Analyse IA avec Claude
      const aiAnalysis = await this.analyzeWithClaude(ocrText, 'image', imageFile.name);
      
      return {
        success: true,
        data: aiAnalysis.data,
        source: { type: 'image', value: imageFile.name },
        processingTime: Date.now() - startTime,
        aiAnalysis: {
          model: 'claude-3.5-sonnet',
          confidence: aiAnalysis.confidence,
          reasoning: aiAnalysis.reasoning
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: { type: 'image', value: imageFile.name },
        processingTime: Date.now() - startTime
      };
    }
  }

  // Vérification en base de données locale
  private async checkLocalDatabase(barcode: string): Promise<ScrapedProductData | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error || !data) return null;

      return {
        name: data.name,
        description: data.description,
        manufacturer: data.manufacturer,
        category: data.category,
        barcode: data.barcode,
        confidence: 100
      };
    } catch {
      return null;
    }
  }

  // Scraping via APIs externes
  private async scrapeExternalAPIs(barcode: string): Promise<Record<string, unknown>[]> {
    const results: Record<string, unknown>[] = [];

    // API OpenFoodFacts (gratuite)
    try {
      const openFoodFacts = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      if (openFoodFacts.ok) {
        const data = await openFoodFacts.json();
        if (data.status === 1) {
          results.push({
            source: 'openfoodfacts',
            data: data.product
          });
        }
      }
    } catch (error) {
      console.warn('OpenFoodFacts API error:', error);
    }

    // API UPC Database (gratuite avec limite)
    try {
      const upcDatabase = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
      if (upcDatabase.ok) {
        const data = await upcDatabase.json();
        if (data.items && data.items.length > 0) {
          results.push({
            source: 'upcitemdb',
            data: data.items[0]
          });
        }
      }
    } catch (error) {
      console.warn('UPC Database API error:', error);
    }

    return results;
  }

  // Scraping de page web
  private async scrapeWebPage(url: string): Promise<string> {
    try {
      // Utiliser un service de scraping ou une API
      const response = await fetch(`/api/scrape-page?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error('Failed to scrape page');
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Web scraping failed: ${error}`);
    }
  }

  // OCR sur image
  private async performOCR(imageFile: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('OCR failed');
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      throw new Error(`OCR failed: ${error}`);
    }
  }

  // Analyse IA avec Claude
  private async analyzeWithClaude(
    inputData: string | Record<string, unknown> | Record<string, unknown>[], 
    inputType: string, 
    inputValue: string
  ): Promise<{
    data: ScrapedProductData;
    confidence: number;
    reasoning: string;
  }> {
    // Récupérer les paramètres utilisateur
    const settings = this.getUserSettings();
    
    if (!settings.claudeApiKey) {
      throw new Error('Claude API key not configured. Please configure it in Settings.');
    }

    const prompt = this.buildClaudePrompt(inputData, inputType, inputValue, settings.customPrompt);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: settings.model || 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.content[0].text;
      
      // Parser la réponse JSON de Claude
      const parsedData = this.parseClaudeResponse(content);
      
      return parsedData;
    } catch (error) {
      throw new Error(`Claude analysis failed: ${error}`);
    }
  }

  // Récupérer les paramètres utilisateur
  private getUserSettings() {
    if (typeof window === 'undefined') {
      return {
        claudeApiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '',
        model: 'claude-3-5-sonnet-20241022',
        minConfidence: 75,
        customPrompt: ''
      };
    }

    const settings = localStorage.getItem('ai_settings');
    if (settings) {
      return JSON.parse(settings);
    }

    return {
      claudeApiKey: '',
      model: 'claude-3-5-sonnet-20241022',
      minConfidence: 75,
      customPrompt: ''
    };
  }

  // Construction du prompt pour Claude
  private buildClaudePrompt(inputData: string | Record<string, unknown> | Record<string, unknown>[], inputType: string, inputValue: string, customPrompt?: string): string {
    const systemPrompt = customPrompt || `Tu es un expert en analyse de données produit. Analyse les données suivantes et extrais les informations produit de manière structurée.`;
    
    return `${systemPrompt}

Type d'entrée: ${inputType}
Valeur: ${inputValue}

Données à analyser:
${JSON.stringify(inputData, null, 2)}

Réponds UNIQUEMENT avec un JSON valide dans ce format exact:
{
  "name": "Nom du produit",
  "description": "Description détaillée",
  "manufacturer": "Fabricant/Marque",
  "category": "Catégorie du produit",
  "barcode": "Code-barres si trouvé",
  "price": 0.00,
  "weight": 0.0,
  "dimensions": {
    "length": 0.0,
    "width": 0.0,
    "height": 0.0
  },
  "images": ["url1", "url2"],
  "specifications": {},
  "confidence": 85,
  "reasoning": "Explication de l'analyse et du niveau de confiance"
}

Règles importantes:
- confidence: Score de 0 à 100 basé sur la qualité des données
- reasoning: Explication claire de l'analyse
- Utilise null pour les champs non trouvés
- Sois précis et conservateur dans l'extraction
- Priorise la qualité sur la quantité des données`;
  }

  // Parser la réponse de Claude
  private parseClaudeResponse(content: string): {
    data: ScrapedProductData;
    confidence: number;
    reasoning: string;
  } {
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        data: {
          name: parsed.name || 'Produit non identifié',
          description: parsed.description,
          manufacturer: parsed.manufacturer,
          category: parsed.category,
          barcode: parsed.barcode,
          price: parsed.price,
          weight: parsed.weight,
          dimensions: parsed.dimensions,
          images: parsed.images,
          specifications: parsed.specifications,
          confidence: parsed.confidence || 0
        },
        confidence: parsed.confidence || 0,
        reasoning: parsed.reasoning || 'Analyse effectuée'
      };
    } catch (error) {
      throw new Error(`Failed to parse Claude response: ${error}`);
    }
  }

  // Sauvegarder les données scrapées en base
  async saveScrapedData(productId: string, scrapedData: ScrapedProductData): Promise<void> {
    try {
      const { error } = await supabase
        .from('scraped_data')
        .insert({
          product_id: productId,
          data: scrapedData,
          confidence: scrapedData.confidence,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to save scraped data: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving scraped data:', error);
      throw error;
    }
  }
}

// Instance singleton
export const scrapingService = ScrapingService.getInstance();



