import { NextRequest, NextResponse } from 'next/server';
import { enrichProduct, enrichWithCategorySuggestions } from '@/lib/product-enrichment';

/**
 * API Route pour l'enrichissement des produits
 * POST /api/enrich
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcode, action = 'enrich' } = body;
    
    if (!barcode) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Code-barres requis' 
        },
        { status: 400 }
      );
    }
    
    // Valider le format du code-barres
    if (!/^\d{8,13}$/.test(barcode)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Format de code-barres invalide (8-13 chiffres requis)' 
        },
        { status: 400 }
      );
    }
    
    console.log(`🚀 API Enrich: ${action} pour le code ${barcode}`);
    
    if (action === 'enrich') {
      // Enrichissement complet du produit
      const result = await enrichProduct(barcode);
      
      if (result && result.success) {
        return NextResponse.json({
          success: true,
          data: result,
        });
      } else {
        return NextResponse.json({
          success: false,
          data: result,
          error: 'Aucune donnée trouvée pour ce code-barres',
        });
      }
    } else if (action === 'suggest-categories') {
      // Suggestions de catégories
      const { productName } = body;
      
      if (!productName) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Nom du produit requis pour les suggestions' 
          },
          { status: 400 }
        );
      }
      
      const categories = await enrichWithCategorySuggestions(productName);
      
      return NextResponse.json({
        success: true,
        data: {
          categories,
        },
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Action non supportée' 
        },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('❌ Erreur API Enrich:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/enrich - Informations sur les APIs disponibles
 */
export async function GET() {
  try {
    const { getApiStatus, getEnrichmentStats } = await import('@/lib/product-enrichment');
    
    const apiStatus = getApiStatus();
    const stats = getEnrichmentStats();
    
    return NextResponse.json({
      success: true,
      data: {
        apiStatus,
        stats,
        endpoints: {
          enrich: 'POST /api/enrich',
          suggestCategories: 'POST /api/enrich?action=suggest-categories',
        },
      },
    });
  } catch (error) {
    console.error('❌ Erreur API Enrich GET:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des informations' 
      },
      { status: 500 }
    );
  }
}
