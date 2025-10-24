/**
 * API pour classifier les images avec l'IA
 * Détermine si une image est : product, lifestyle, ou unwanted
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

interface ImageAnalysis {
  imageUrl: string;
  type: 'product' | 'lifestyle' | 'other' | 'unwanted';
  confidence: number;
  reason: string;
  matches_product: boolean;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 [Classify Images] Début classification');
    
    const body = await request.json();
    const { imageUrls, productName, productDescription, filterType = 'all' } = body;
    const apiKey = body.apiKey || process.env.ANTHROPIC_API_KEY;
    const model = body.model || 'claude-sonnet-4-20250514';
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Anthropic non configurée' },
        { status: 500 }
      );
    }
    
    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'Aucune image à classifier' },
        { status: 400 }
      );
    }
    
    console.log(`🎨 [Classify Images] ${imageUrls.length} images à analyser`);
    console.log('📦 [Classify Images] Produit:', productName);
    console.log('🎯 [Classify Images] Filtre demandé:', filterType);
    
    const anthropic = new Anthropic({ apiKey });
    
    // Instruction spécifique selon le filtre
    let filterInstruction = '';
    if (filterType === 'product') {
      filterInstruction = `
FILTRE ACTIF : L'utilisateur veut UNIQUEMENT les photos produit (pack shots).
Tu dois être TRÈS STRICT :
- Classe en "product" UNIQUEMENT les pack shots sur fond blanc/uni avec produit COMPLET
- Tout le reste (lifestyle, détails, autres) doit être classé en "unwanted" pour être supprimé
`;
    } else if (filterType === 'lifestyle') {
      filterInstruction = `
FILTRE ACTIF : L'utilisateur veut UNIQUEMENT les photos lifestyle (mise en situation).
Tu dois être TRÈS STRICT :
- Classe en "lifestyle" UNIQUEMENT les vraies mises en situation avec décor/personne
- Tout le reste (pack shots, détails, autres) doit être classé en "unwanted" pour être supprimé
`;
    }
    
    // Analyser toutes les images en une seule requête
    const prompt = `Tu es un expert TRÈS STRICT en classification d'images produits e-commerce.

${filterInstruction}

PRODUIT À ANALYSER :
Nom: ${productName}
Description: ${productDescription || 'Non fournie'}

J'ai ${imageUrls.length} images à classifier. Pour CHAQUE image, détermine :

1. TYPE D'IMAGE (SOIS TRÈS STRICT) :
   - "product" : Pack shot professionnel sur fond UNI (blanc, noir, gris, ou couleur unie), produit complet visible, détouré, style catalogue
   - "lifestyle" : Photo RÉELLE avec environnement (salon, table, meuble, personne, décor réel). Pas juste un fond coloré ou dégradé !
   - "other" : Détails/gros plans sur une partie du produit, zoom, vue éclatée, schéma technique, détails de ports/boutons
   - "unwanted" : Autre produit différent, logo seul, icône, placeholder, image non pertinente

2. CORRESPONDANCE PRODUIT :
   - L'image montre-t-elle bien le produit "${productName}" ?
   - Vérifie la forme, la couleur, les caractéristiques distinctives

3. CONFIANCE (0.0 à 1.0)

RÈGLES IMPORTANTES :
- Pack shot = produit COMPLET sur fond UNI (blanc/noir/gris/couleur) → "product"
- Zoom/détail d'une PARTIE du produit → "other"
- Photo avec environnement RÉEL (meubles, pièce, décor) → "lifestyle"
- Fond coloré ou dégradé SEUL sans décor → "product" (c'est un pack shot artistique)
- Autre produit (modèle différent) → "unwanted"
- Logo/icône seul → "unwanted"

EXEMPLES CLAIRS :
✅ PRODUCT :
- Sonos Sub Mini complet sur fond blanc → "product"
- Sonos Sub Mini complet sur fond noir → "product"
- Sonos Sub Mini sur fond rose/bleu/dégradé → "product"

✅ LIFESTYLE :
- Sub Mini dans un salon avec canapé → "lifestyle"
- Sub Mini sur une table en bois avec livres → "lifestyle"
- Sub Mini dans une pièce réelle → "lifestyle"

✅ OTHER :
- Gros plan sur le port du Sub Mini → "other"
- Vue éclatée des composants → "other"
- Détail du bouton/grille → "other"

❌ UNWANTED :
- Sonos Sub (carré) alors que produit = Sub Mini (rond) → "unwanted"
- Logo Sonos seul → "unwanted"

RETOURNE UN JSON AVEC CE FORMAT EXACT :
{
  "analyses": [
    {
      "index": 0,
      "type": "product",
      "confidence": 0.95,
      "reason": "Pack shot sur fond blanc, produit complet visible",
      "matches_product": true
    },
    {
      "index": 1,
      "type": "other",
      "confidence": 0.88,
      "reason": "Gros plan sur connecteur HDMI du produit",
      "matches_product": true
    },
    {
      "index": 2,
      "type": "unwanted",
      "confidence": 0.90,
      "reason": "Montre le Sonos Sub (carré) au lieu du Sub Mini (rond)",
      "matches_product": false
    }
  ]
}

URLs des images : ${JSON.stringify(imageUrls, null, 2)}`;

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Réponse IA invalide');
    }

    // Parser la réponse JSON
    const jsonText = content.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const result = JSON.parse(jsonText);
    
    console.log('✅ [Classify Images] Classification terminée');
    console.log('📊 [Classify Images] Résultats:', result.analyses?.length, 'images analysées');
    
    return NextResponse.json({
      success: true,
      analyses: result.analyses || [],
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [Classify Images] Erreur:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la classification des images',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

