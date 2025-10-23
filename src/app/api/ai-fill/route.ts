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

export const runtime = 'edge';

// Interface pour les données du produit
interface ProductData {
  name?: string;
  brand?: string;
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

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 [Fonction 2] Début remplissage IA');
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Anthropic non configurée' },
        { status: 500 }
      );
    }
    
    // Récupérer les données actuelles du produit
    const body = await request.json();
    const currentData: ProductData = body.productData;
    
    console.log('📦 [Fonction 2] Données actuelles:', currentData);
    
    // Initialiser le client Anthropic
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });
    
    // Prompt pour Claude
    const prompt = `Tu es un assistant expert en produits technologiques et informatiques.

PRODUIT À ANALYSER :
- Nom : ${currentData.name || 'Non renseigné'}
- Marque : ${currentData.brand || 'Non renseignée'}
- Code-barres : ${currentData.barcode || 'Non renseigné'}
- Référence interne : ${currentData.internal_ref || 'Non renseignée'}

TA MISSION :
1. Identifier précisément ce produit
2. Rechercher les informations complètes sur le site officiel de la marque
3. Extraire TOUTES les informations disponibles

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
  "long_description": "Description détaillée complète avec spécifications techniques",
  "selling_price_htva": 999.99,
  "warranty_period": "2 ans",
  "category": "Catégorie du produit",
  "specifications": {
    "processor": "...",
    "memory": "...",
    "storage": "...",
    "connectivity": "...",
    "dimensions": "...",
    "weight": "...",
    "color": "...",
    "other": "..."
  }
}

RÉPONDS UNIQUEMENT avec le JSON, AUCUN texte avant ou après.`;

    console.log('💬 [Fonction 2] Envoi du prompt à Claude...');
    
    // Appel à Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
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
    
    console.log('📄 [Fonction 2] Contenu brut:', responseText);
    
    // Parser le JSON (enlever les éventuels backticks markdown)
    const jsonText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const aiData = JSON.parse(jsonText);
    
    console.log('✅ [Fonction 2] Données parsées:', aiData);
    
    // Retourner les données + indicateur que c'est de l'IA
    return NextResponse.json({
      success: true,
      data: aiData,
      aiGenerated: true, // Important pour ajouter les icônes robot
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

