import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Test Supabase - Début');
    
    // Test de connexion
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name
        )
      `)
      .limit(5);
    
    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 500 });
    }
    
    console.log('✅ Produits récupérés:', products?.length || 0);
    
    return NextResponse.json({ 
      success: true, 
      count: products?.length || 0,
      products: products || []
    });
    
  } catch (error) {
    console.error('❌ Erreur API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
