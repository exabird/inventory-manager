/**
 * API Route pour la Fonction 2 : Remplissage IA Avancé
 * 
 * Utilise Claude pour :
 * 1. Rechercher le produit sur le site de la marque
 * 2. Extraire toutes les informations disponibles
 * 3. Retourner un JSON structuré pour remplir le formulaire
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Interface pour les données du produit
interface ProductData {
  id?: string;
  name?: string;
  brand?: string;
  brand_id?: string; // 🆕 ID de la marque
  manufacturer?: string;
  internal_ref?: string;
  barcode?: string;
  short_description?: string;
  long_description?: string;
  purchase_price_htva?: number;
  selling_price_htva?: number;
  warranty_period?: string;
  category?: string;
}

// 🆕 Fonction pour récupérer le prompt IA personnalisé de la marque
async function getBrandAIPrompt(brandId?: string): Promise<string | null> {
  if (!brandId) return null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('brands')
      .select('ai_fetch_prompt, name')
      .eq('id', brandId)
      .single();

    if (error || !data) {
      console.warn('⚠️ [getBrandAIPrompt] Marque introuvable:', brandId);
      return null;
    }

    if (data.ai_fetch_prompt) {
      console.log('🎯 [getBrandAIPrompt] Prompt IA trouvé pour:', data.name);
      return data.ai_fetch_prompt;
    }

    return null;
  } catch (error) {
    console.error('❌ [getBrandAIPrompt] Erreur:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 [Fonction 2] Début remplissage IA');
    
    // Récupérer les données actuelles du produit, la clé API, le modèle, le champ ciblé ET le mode
    const body = await request.json();
    const currentData: ProductData = body.product || body.productData; // Accepter "product" OU "productData"
    const apiKey = body.apiKey || process.env.ANTHROPIC_API_KEY;
    const model = body.model || 'claude-sonnet-4-20250514'; // Claude 4.5 par défaut
    const targetField = body.targetField; // Champ spécifique à remplir
    const mode = body.mode || 'standard'; // Mode : 'standard', 'full_copy', ou 'images_only'
    const images_only = body.images_only || false; // Mode images uniquement
    const filterType = body.filterType || 'all'; // Type de filtre pour les images
    const productName = body.name || currentData?.name;
    const productBarcode = body.barcode || currentData?.barcode;
    
    // 🆕 Récupérer le prompt IA personnalisé de la marque
    const brandPrompt = await getBrandAIPrompt(currentData?.brand_id);
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Anthropic non configurée. Allez dans Paramètres pour la configurer.' },
        { status: 500 }
      );
    }
    
    console.log('📦 [Fonction 2] Données actuelles:', currentData);
    console.log('🤖 [Fonction 2] Modèle utilisé:', model);
    console.log('🎯 [Fonction 2] Champ ciblé:', targetField || 'Tous les champs');
    console.log('🎨 [Fonction 2] Mode:', mode);
    console.log('🖼️ [Fonction 2] Images only:', images_only);
    console.log('🔍 [Fonction 2] Filter type:', filterType);
    console.log('🏷️ [Fonction 2] Prompt IA marque:', brandPrompt ? '✅ Personnalisé' : '❌ Standard');
    
    // MODE SPÉCIAL : Récupération d'images uniquement
    if (images_only || mode === 'images_only') {
      console.log('🖼️ [Mode Images Only] Début récupération images uniquement');
      
      let scrapedContent: any = null;
      let debugInfo: any = {
        step: '',
        error: '',
        details: {}
      };
      
      try {
        // Étape 1 : Trouver l'URL du produit avec l'IA
        debugInfo.step = 'url_finding';
        console.log('🌐 [Mode Images Only] Recherche de l\'URL du produit...');
        
        const anthropic = new Anthropic({ apiKey: apiKey });
        
        // Prompt amélioré qui fonctionne sans prompt de marque
        const urlFindingPrompt = `Tu es un expert en recherche de produits en ligne.

PRODUIT À RECHERCHER :
- Nom: ${currentData?.name || 'Non fourni'}
- Marque: ${currentData?.brand || currentData?.manufacturer || 'Non fournie'}
- Code-barres: ${currentData?.barcode || 'Non fourni'}

${brandPrompt ? `\n🎯 INSTRUCTIONS SPÉCIFIQUES À LA MARQUE :\n${brandPrompt}\n` : `
TA MISSION :
1. Trouve l'URL de la page produit OFFICIELLE sur le site du fabricant
2. Priorise TOUJOURS les sites officiels (.com, .fr, etc. du fabricant)
3. Si le fabricant est connu (Sonos, Apple, Samsung, etc.), utilise leur site officiel
4. Recherche par le nom exact du produit sur le site du fabricant

EXEMPLES DE SITES OFFICIELS :
- Sonos → sonos.com
- Apple → apple.com
- Samsung → samsung.com
- Ubiquiti → ui.com ou store.ui.com
`}

IMPORTANT :
- Retourne UNIQUEMENT l'URL complète (https://...)
- PAS de texte supplémentaire
- PAS d'explication
- JUSTE l'URL`;

        // 🔍 Logger le prompt utilisé
        debugInfo.details.promptType = brandPrompt ? 'custom' : 'standard';
        if (brandPrompt) {
          console.log('🏷️ [Mode Images Only] ✅ Prompt personnalisé de la marque utilisé');
          console.log('📝 [Mode Images Only] Extrait:', brandPrompt.substring(0, 150) + '...');
        } else {
          console.log('🔍 [Mode Images Only] Prompt standard utilisé (recherche intelligente)');
        }

        const urlResponse = await anthropic.messages.create({
          model: model,
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: urlFindingPrompt
          }]
        });

        const productUrl = urlResponse.content[0].type === 'text' 
          ? urlResponse.content[0].text.trim() 
          : '';
        
        debugInfo.details.urlFound = productUrl;
        console.log('✅ [Mode Images Only] URL trouvée par l\'IA:', productUrl);
        
        // Validation de l'URL
        if (!productUrl || !productUrl.startsWith('http')) {
          debugInfo.error = 'URL invalide ou non trouvée par l\'IA';
          debugInfo.details.urlReceived = productUrl;
          throw new Error(`L'IA n'a pas trouvé d'URL valide. Réponse reçue: "${productUrl}"`);
        }

        // Étape 2 : Scraper la page
        debugInfo.step = 'scraping';
        console.log('🕷️ [Mode Images Only] Scraping de la page:', productUrl);
        
        // Utiliser le scraper avancé (Puppeteer) pour les pages avec JavaScript
        const scrapeResponse = await fetch(`${request.nextUrl.origin}/api/scrape-product-page-advanced`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: productUrl })
        });

        if (!scrapeResponse.ok) {
          const errorText = await scrapeResponse.text();
          debugInfo.error = 'Échec du scraping';
          debugInfo.details.scrapeStatus = scrapeResponse.status;
          debugInfo.details.scrapeError = errorText;
          throw new Error(`Scraping échoué (${scrapeResponse.status}): ${errorText}`);
        }

        const scrapeData = await scrapeResponse.json();
        scrapedContent = scrapeData;
        debugInfo.details.imagesFound = scrapedContent.images?.length || 0;
        
        console.log('✅ [Mode Images Only] Page scrapée avec succès');
        console.log('🖼️ [Mode Images Only] Images trouvées:', scrapedContent.images?.length || 0);

        if (!scrapedContent.images || scrapedContent.images.length === 0) {
          debugInfo.error = 'Aucune image trouvée sur la page';
          debugInfo.details.pageTitle = scrapeData.title || 'Inconnu';
          throw new Error(`Aucune image trouvée sur la page scrapée. Titre de la page: "${scrapeData.title || 'Inconnu'}"`);
        }

        // Étape 3 : Télécharger les images dans Supabase
        if (!currentData?.id) {
          debugInfo.error = 'ID produit manquant';
          throw new Error('Impossible de télécharger les images: ID produit manquant');
        }

        debugInfo.step = 'downloading';
        console.log('📥 [Mode Images Only] Téléchargement de', scrapedContent.images.length, 'images vers Supabase...');
        
        const downloadResponse = await fetch(`${request.nextUrl.origin}/api/download-images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageUrls: scrapedContent.images,
            productId: currentData.id
          })
        });

        if (!downloadResponse.ok) {
          const errorText = await downloadResponse.text();
          debugInfo.error = 'Échec du téléchargement';
          debugInfo.details.downloadError = errorText;
          throw new Error(`Téléchargement échoué: ${errorText}`);
        }

        const downloadData = await downloadResponse.json();
        debugInfo.details.imagesUploaded = downloadData.successCount;
        debugInfo.details.imagesFailed = downloadData.totalCount - downloadData.successCount;
        
        console.log(`✅ [Mode Images Only] Images uploadées: ${downloadData.successCount}/${downloadData.totalCount}`);
        
        // Préparer la liste des URLs Supabase
        if (downloadData.results && downloadData.results.length > 0) {
          const supabaseImages = downloadData.results
            .filter((r: any) => r.success)
            .map((r: any) => r.supabaseUrl);
          
          console.log('✅ [Mode Images Only] Retour des URLs Supabase:', supabaseImages.length);
          
          // Retourner directement les URLs
          return NextResponse.json({
            success: true,
            data: {},
            aiGenerated: false,
            scrapingUsed: true,
            supabaseImages: supabaseImages,
            debugInfo: debugInfo,
            timestamp: new Date().toISOString()
          });
        } else {
          debugInfo.error = 'Aucune image téléchargée avec succès';
          throw new Error('Toutes les images ont échoué lors du téléchargement');
        }
        
      } catch (error: any) {
        console.error('❌ [Mode Images Only] Erreur:', error.message);
        console.error('🔍 [Mode Images Only] Debug info:', debugInfo);
        
        // Retourner une erreur détaillée
        return NextResponse.json({
          success: false,
          error: error.message || 'Erreur lors de la récupération des images',
          debugInfo: debugInfo,
          supabaseImages: [],
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }
    }
    
    // Initialiser le client Anthropic pour les autres modes
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });
    
    // Prompt adapté selon si on cible un champ spécifique ou tous les champs
    let prompt: string;
    let scrapedContent: any = null; // Déclaré au niveau de la fonction
    
    if (targetField) {
      // Mode champ unique : prompt simplifié et ciblé
      
      // Pour long_description : gérer les 2 modes
      let longDescriptionPrompt = '';
      
      if (targetField === 'long_description') {
        if (mode === 'full_copy') {
          // Mode "Récopie complète" : scraper d'abord la page réelle
          console.log('🌐 [Fonction 2] Mode récopie complète - recherche de l\'URL du produit...');
          
          // Étape 1 : Demander à l'IA de trouver l'URL de la page produit
          const urlFindingPrompt = `Tu es un expert en recherche de produits tech.

PRODUIT :
- Nom : ${productName || 'Non renseigné'}
- Code-barres : ${productBarcode || 'Non renseigné'}

TA MISSION :
Trouve l'URL EXACTE de la page produit sur le site OFFICIEL du fabricant.

${brandPrompt ? `\n🎯 INSTRUCTIONS SPÉCIFIQUES À LA MARQUE :\n${brandPrompt}\n` : ''}
EXEMPLES :
- Sonos One SL → https://www.sonos.com/fr-fr/shop/one-sl
- Apple iPhone 15 Pro → https://www.apple.com/fr/iphone-15-pro/
- Samsung Galaxy S24 → https://www.samsung.com/fr/smartphones/galaxy-s24/

RETOURNE UNIQUEMENT UN JSON :
{
  "url": "URL_EXACTE_DE_LA_PAGE_PRODUIT",
  "brand": "Nom de la marque"
}

RÉPONDS UNIQUEMENT avec le JSON, AUCUN texte avant ou après.`;

          try {
            const urlMessage = await anthropic.messages.create({
              model: model,
              max_tokens: 500,
              messages: [{ role: 'user', content: urlFindingPrompt }]
            });

            const urlResponseText = urlMessage.content[0].type === 'text' 
              ? urlMessage.content[0].text 
              : '';
            
            const urlJsonText = urlResponseText
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .trim();
            
            const urlData = JSON.parse(urlJsonText);
            const productUrl = urlData.url;

            console.log('✅ [Fonction 2] URL trouvée:', productUrl);

            // Étape 2 : Scraper la page
            console.log('🕷️ [Fonction 2] Scraping de la page...');
            
            // Utiliser le scraper avancé (Puppeteer) pour les pages avec JavaScript
            const scrapeResponse = await fetch(`${request.nextUrl.origin}/api/scrape-product-page-advanced`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: productUrl })
            });

            if (scrapeResponse.ok) {
              const scrapeData = await scrapeResponse.json();
              scrapedContent = scrapeData; // Le scraper avancé retourne directement les données
              console.log('✅ [Fonction 2] Page scrapée avec succès');
              console.log('📊 [Fonction 2] HTML:', scrapedContent.html.length, 'caractères');
              console.log('🖼️ [Fonction 2] Images:', scrapedContent.images.length);

              // Étape 3 : Télécharger les images dans Supabase
              if (scrapedContent.images && scrapedContent.images.length > 0 && currentData?.id) {
                console.log('📥 [Fonction 2] Téléchargement des images vers Supabase...');
                
                try {
                  const downloadResponse = await fetch(`${request.nextUrl.origin}/api/download-images`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      imageUrls: scrapedContent.images,
                      productId: currentData.id
                    })
                  });

                  if (downloadResponse.ok) {
                    const downloadData = await downloadResponse.json();
                    console.log(`✅ [Fonction 2] Images uploadées: ${downloadData.successCount}/${downloadData.totalCount}`);
                    
                    // Remplacer les URLs externes par les URLs Supabase dans le HTML
                    if (downloadData.results && downloadData.results.length > 0) {
                      scrapedContent.supabaseImages = downloadData.results
                        .filter((r: any) => r.success)
                        .map((r: any) => r.supabaseUrl);
                      
                      console.log('✅ [Fonction 2] URLs Supabase disponibles:', scrapedContent.supabaseImages.length);
                    }
                  }
                } catch (downloadError) {
                  console.error('⚠️ [Fonction 2] Erreur téléchargement images:', downloadError);
                }
              }
            }
          } catch (scrapeError) {
            console.error('⚠️ [Fonction 2] Erreur scraping:', scrapeError);
          }

          // Mode "Récopie complète" avec contenu scrapé
          if (scrapedContent) {
            // Utiliser les URLs Supabase si disponibles, sinon les URLs externes
            const imagesToUse = scrapedContent.supabaseImages || scrapedContent.images;
            const imageSource = scrapedContent.supabaseImages ? 'SUPABASE (uploadées)' : 'EXTERNES (originales)';
            
            longDescriptionPrompt = `RECRÉE une page produit professionnelle en HTML à partir du contenu suivant :

CONTENU SCRAPÉ DE LA PAGE OFFICIELLE :
${scrapedContent.html}

IMAGES DISPONIBLES (${imageSource}) :
${imagesToUse.map((img: string, i: number) => `Image ${i+1}: ${img}`).join('\n')}

TA MISSION :
1. RECRÉE une version HTML complète et professionnelle
2. Conserve TOUTE la structure (titres, paragraphes, listes)
3. Intègre les images avec leurs URLs complètes : <img src="URL_ICI" alt="Description" />
4. Améliore la mise en forme avec <strong> pour les mots importants
5. Assure une hiérarchie claire des titres
6. Garde le maximum de contenu

FORMAT DE SORTIE :
Retourne le HTML complet directement (sans JSON, juste le HTML).`;
          } else {
            // Fallback si le scraping échoue
            longDescriptionPrompt = 'une description détaillée EN HTML STRUCTURÉ (recherche sur le site officiel et copie le contenu) avec : <h2>Titre principal</h2>, <p>Paragraphes détaillés</p>, <ul><li>Points clés</li></ul>, <strong>texte en gras</strong>, <img src="URL" alt="..." />. Maximum de contenu.';
          }
        } else {
          // Mode "Standard" : description longue résumée
          longDescriptionPrompt = 'une description détaillée EN HTML STRUCTURÉ (comme sur la page produit du fabricant) avec : <h2>Titre principal</h2>, <p>Paragraphes détaillés</p>, <ul><li>Points clés</li></ul>, <strong>texte en gras</strong>. Minimum 3-4 paragraphes bien développés avec structure HTML professionnelle';
        }
      }
      
      const fieldDescriptions: Record<string, string> = {
        // Champs principaux
        'long_description': longDescriptionPrompt,
        'short_description': 'une description courte en 1 phrase (max 150 caractères)',
        'selling_price_htva': 'le prix de vente HTVA en euros (nombre uniquement)',
        'warranty_period': 'la période de garantie (ex: "2 ans")',
        'brand': 'le nom de la marque',
        'manufacturer': 'le nom du fabricant',
        'manufacturer_ref': 'la référence fabricant exacte',
        'name': 'le nom complet du produit',
        'category': 'la catégorie du produit',
        
        // Spécifications techniques - Informatique
        'processor': 'le modèle du processeur (ex: "Intel Core i5-1135G7")',
        'ram_gb': 'la mémoire RAM en Go (nombre uniquement, ex: 8)',
        'storage_gb': 'la capacité de stockage en Go (nombre uniquement, ex: 256)',
        'storage_type': 'le type de stockage (ex: "SSD NVMe", "HDD")',
        'screen_size_inches': 'la taille de l\'écran en pouces (nombre uniquement, ex: 15.6)',
        'resolution': 'la résolution de l\'écran (ex: "1920x1080", "4K")',
        'operating_system': 'le système d\'exploitation (ex: "Windows 11 Pro", "macOS")',
        'graphics_card': 'la carte graphique (ex: "NVIDIA GeForce RTX 3060")',
        
        // Connectivité
        'hdmi_ports': 'le nombre de ports HDMI (nombre uniquement)',
        'usb_ports': 'le nombre de ports USB (nombre uniquement)',
        'usb_type_c_ports': 'le nombre de ports USB-C (nombre uniquement)',
        'ethernet_port': '"true" si port Ethernet présent, "false" sinon',
        'wifi': 'la version Wi-Fi (ex: "Wi-Fi 6", "802.11ax")',
        'bluetooth': 'la version Bluetooth (ex: "5.2", "5.0")',
        
        // Audio
        'power_output_watts': 'la puissance de sortie en watts (nombre uniquement)',
        'frequency_response': 'la réponse en fréquence (ex: "50 Hz - 20 kHz")',
        'audio_formats': 'les formats audio supportés (ex: "MP3,AAC,WAV,FLAC")',
        'audio_inputs': 'les entrées audio (ex: "Wi-Fi,AirPlay 2,Bluetooth")',
        'voice_assistants': 'les assistants vocaux supportés (ex: "Amazon Alexa,Google Assistant")',
        
        // Dimensions & Design
        'width_mm': 'la largeur en millimètres (nombre uniquement)',
        'height_mm': 'la hauteur en millimètres (nombre uniquement)',
        'depth_mm': 'la profondeur en millimètres (nombre uniquement)',
        'weight_kg': 'le poids en kilogrammes (nombre uniquement)',
        'color': 'la couleur du produit (ex: "Noir", "Gris argenté")',
        'material': 'le matériau principal (ex: "Aluminium", "Plastique")',
        'touch_controls': '"true" si commandes tactiles présentes, "false" sinon',
        'humidity_resistant': '"true" si résistant à l\'humidité, "false" sinon',
        
        // Autres
        'battery_life_hours': 'l\'autonomie de la batterie en heures (nombre uniquement)',
        'warranty_months': 'la durée de garantie en mois (nombre uniquement)'
      };
      
      const fieldDescription = fieldDescriptions[targetField] || `la valeur du champ "${targetField}" (cherche la spécification technique correspondante)`;
      
      // Si mode full_copy avec contenu scrapé, le prompt est déjà complet
      if (targetField === 'long_description' && mode === 'full_copy' && scrapedContent) {
        prompt = longDescriptionPrompt;
      } else {
        // Mode standard : JSON
        prompt = `Tu es un assistant expert en produits technologiques.

PRODUIT :
- Nom : ${productName || 'Non renseigné'}
- Code-barres : ${productBarcode || 'Non renseigné'}

TA MISSION :
Trouve UNIQUEMENT ${fieldDescription} pour ce produit.

${brandPrompt ? `\n🎯 INSTRUCTIONS SPÉCIFIQUES À LA MARQUE :\n${brandPrompt}\n` : ''}
RETOURNE UN JSON STRICTEMENT dans ce format :
{
  "${targetField}": "ta réponse ici"
}

IMPORTANT :
- Recherche sur le site officiel de la marque
- Si l'information n'est pas disponible, retourne null
- RETOURNE UNIQUEMENT LE JSON, rien d'autre

RÉPONDS UNIQUEMENT avec le JSON, AUCUN texte avant ou après.`;
      }
      
    } else {
      // Mode complet : tous les champs
      prompt = `Tu es un assistant expert en produits technologiques et informatiques.

PRODUIT À ANALYSER :
- Nom : ${productName || 'Non renseigné'}
- Marque : ${currentData?.brand || 'Non renseignée'}
- Code-barres : ${productBarcode || 'Non renseigné'}
- Référence interne : ${currentData?.internal_ref || 'Non renseignée'}

TA MISSION :
1. Identifier précisément ce produit
2. Rechercher les informations complètes sur le site officiel de la marque
3. Extraire TOUTES les informations disponibles

${brandPrompt ? `\n🎯 INSTRUCTIONS SPÉCIFIQUES À LA MARQUE :\n${brandPrompt}\n` : ''}
IMPORTANT :
- Recherche sur le site OFFICIEL de la marque (ex: apple.com, ubiquiti.com, etc.)
- Privilégie les informations officielles
- Si plusieurs variantes existent, choisis la plus courante
- Pour les prix, donne une estimation si non disponible

RETOURNE UN JSON STRICTEMENT dans ce format (tous les champs sont optionnels) :

{
  "name": "Nom complet du produit",
  "brand": "Nom de la marque",
  "manufacturer": "Nom du fabricant",
  "manufacturer_ref": "Référence fabricant exacte",
  "short_description": "Description courte (1 phrase, max 150 caractères)",
  "long_description": "<h2>Présentation</h2><p>Description détaillée du produit...</p><h2>Caractéristiques principales</h2><ul><li>Point clé 1</li><li>Point clé 2</li></ul><p>Texte complémentaire avec <strong>mots importants en gras</strong>.</p>",
  "selling_price_htva": 999.99,
  "warranty_period": "2 ans",
  "category": "Catégorie du produit",
  "technical_specifications": {
    "processor": "Intel Core i5-1135G7",
    "ram_gb": 8,
    "storage_gb": 256,
    "storage_type": "SSD NVMe",
    "screen_size_inches": 15.6,
    "resolution": "1920x1080",
    "hdmi_ports": 1,
    "usb_ports": 3,
    "usb_type_c_ports": 1,
    "ethernet_port": "true",
    "wifi": "Wi-Fi 6",
    "bluetooth": "5.2",
    "battery_life_hours": 8,
    "weight_kg": 1.65,
    "width_mm": 356.0,
    "height_mm": 233.0,
    "depth_mm": 17.9,
    "color": "Gris argenté",
    "operating_system": "Windows 11 Pro",
    "warranty_months": 24,
    "power_output_watts": 40,
    "frequency_response": "50 Hz - 20 kHz",
    "audio_formats": "MP3,AAC,WAV,FLAC",
    "audio_inputs": "Wi-Fi,AirPlay 2",
    "voice_assistants": "Amazon Alexa,Google Assistant",
    "touch_controls": "true",
    "humidity_resistant": "false"
  }
}

NOTES IMPORTANTES pour long_description :
- Génère du HTML STRUCTURÉ comme sur la page produit officielle du fabricant
- Utilise <h2> pour les sections (ex: "Présentation", "Caractéristiques", "Utilisation")
- Utilise <p> pour les paragraphes détaillés
- Utilise <ul><li> pour les listes de points clés
- Utilise <strong> pour les mots importants
- Minimum 3 sections avec 2-3 paragraphes chacune
- Inspire-toi du contenu de la page produit du site officiel de la marque

NOTES IMPORTANTES pour technical_specifications :
- Utilise les clés normalisées selon le type de produit :
  * INFORMATIQUE: processor, ram_gb, storage_gb, screen_size_inches, resolution, operating_system
  * CONNECTIVITÉ: hdmi_ports, usb_ports, ethernet_port, wifi, bluetooth
  * AUDIO: power_output_watts, frequency_response, audio_formats, audio_inputs, voice_assistants
  * DIMENSIONS: weight_kg, width_mm, height_mm, depth_mm
  * DESIGN: color, material, touch_controls, humidity_resistant
- Les valeurs numériques doivent être des nombres (pas de strings)
- Les valeurs booléennes (true/false) doivent être en string: "true" ou "false"
- Inclus toutes les specs techniques disponibles pour le produit
- Si une spec n'est pas disponible, ne l'inclus pas (ne mets pas null)

RÉPONDS UNIQUEMENT avec le JSON, AUCUN texte avant ou après.`;
    }

    console.log('💬 [Fonction 2] Envoi du prompt à Claude...');
    console.log('📝 [Fonction 2] Longueur du prompt:', prompt.length, 'caractères');
    
    // Appel à Claude avec max_tokens adapté
    let maxTokens = 4000; // Par défaut (mode complet)
    if (targetField) {
      // Mode champ unique
      if (targetField === 'long_description' && mode === 'full_copy') {
        maxTokens = 8000; // Beaucoup plus pour récopie complète
      } else {
        maxTokens = 1000; // Standard pour un seul champ
      }
    }
    
    console.log('🎯 [Fonction 2] Max tokens:', maxTokens);
    
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });
    
    console.log('✅ [Fonction 2] Réponse de Claude reçue');
    
    // Extraire le contenu de la réponse
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';
    
    console.log('📄 [Fonction 2] Contenu brut (premiers 500 caractères):', responseText.substring(0, 500));
    
    // Si mode full_copy avec scraping, le résultat est du HTML direct
    let aiData: any;
    
    if (targetField === 'long_description' && mode === 'full_copy' && scrapedContent) {
      // HTML direct - wrap dans un objet JSON
      const htmlContent = responseText
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      aiData = {
        [targetField]: htmlContent
      };
      
      console.log('✅ [Fonction 2] HTML direct parsé, taille:', htmlContent.length, 'caractères');
    } else {
      // JSON standard
    const jsonText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
      aiData = JSON.parse(jsonText);
      console.log('✅ [Fonction 2] JSON parsé:', Object.keys(aiData));
    }
    
    // Retourner les données + indicateur que c'est de l'IA + images Supabase
    return NextResponse.json({
      success: true,
      data: aiData,
      aiGenerated: true,
      scrapingUsed: mode === 'full_copy' && scrapedContent !== null,
      supabaseImages: scrapedContent?.supabaseImages || [],
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [Fonction 2] Erreur:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du remplissage IA',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

