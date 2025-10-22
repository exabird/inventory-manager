// Script de test Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nuonbtjrtacfjifnrziv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b25idGpydGFjZmppZm5yeml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODAzNjQsImV4cCI6MjA3NjU1NjM2NH0.WvQNCCfVv9_QBmHlCQZcoq8rnftgL_5stiAzD_Kt8H4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('🔍 Test de connexion Supabase...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test 1: Lister les produits
    console.log('\n📦 Test 1: Récupération des produits...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('❌ Erreur products:', productsError);
    } else {
      console.log('✅ Produits récupérés:', products.length);
      console.log('Produits:', JSON.stringify(products, null, 2));
    }
    
    // Test 2: Lister les catégories
    console.log('\n📁 Test 2: Récupération des catégories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('❌ Erreur categories:', categoriesError);
    } else {
      console.log('✅ Catégories récupérées:', categories.length);
      console.log('Catégories:', JSON.stringify(categories, null, 2));
    }
    
    // Test 3: Lister les pièces
    console.log('\n🔧 Test 3: Récupération des pièces...');
    const { data: pieces, error: piecesError } = await supabase
      .from('pieces')
      .select('*');
    
    if (piecesError) {
      console.error('❌ Erreur pieces:', piecesError);
    } else {
      console.log('✅ Pièces récupérées:', pieces.length);
      console.log('Pièces:', JSON.stringify(pieces, null, 2));
    }
    
    console.log('\n✅ Tests terminés !');
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

testSupabase();

