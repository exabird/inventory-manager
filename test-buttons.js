#!/usr/bin/env node
/**
 * Test rapide pour vérifier les nouveaux boutons AI
 */

const fetch = require('node-fetch').default;

async function testNewButtons() {
  console.log('🔍 Test des nouveaux boutons AI...\n');
  
  try {
    // Test 1: Vérifier que l'app se charge
    const response = await fetch('http://localhost:3000');
    if (!response.ok) {
      console.log('❌ App ne se charge pas');
      return;
    }
    
    console.log('✅ App chargée');
    
    // Test 2: Vérifier les produits
    const apiResponse = await fetch('http://localhost:3000/api/test-supabase');
    const data = await apiResponse.json();
    
    if (data.success && data.products.length > 0) {
      console.log(`✅ ${data.products.length} produits trouvés`);
      console.log(`   Premier produit: ${data.products[0].name}`);
    }
    
    console.log('\n🎯 Instructions pour tester manuellement:');
    console.log('1. Ouvrez http://localhost:3000');
    console.log('2. Cliquez sur un produit (ex: Sonos Move)');
    console.log('3. Dans l\'inspecteur, cherchez dans le header:');
    console.log('   - Bouton AI Global (Sparkles) avec tooltip');
    console.log('   - Bouton AI Metas Only (FileText)');
    console.log('4. Survolez les boutons pour voir le tooltip');
    console.log('5. Testez les boutons pour voir les erreurs détaillées');
    
    console.log('\n🚀 Si tu ne vois pas les boutons, vide le cache navigateur (Ctrl+Shift+R)');
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

testNewButtons().catch(console.error);
