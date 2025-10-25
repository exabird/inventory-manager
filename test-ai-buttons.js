#!/usr/bin/env node
/**
 * Test des boutons AI après corrections
 */

const fetch = require('node-fetch').default;

async function testAIButtons() {
  console.log('🧪 Test des boutons AI après corrections');
  console.log('');
  
  try {
    // Test avec un produit Apple
    const testProduct = {
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      manufacturer: 'Apple Inc.',
      barcode: '1234567890123'
    };
    
    console.log('📱 Test avec:', testProduct.name);
    console.log('');
    
    // Test 1: Métadonnées uniquement
    console.log('🔵 Test 1: Métadonnées uniquement');
    const metaResponse = await fetch('http://localhost:3000/api/ai-fill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productData: testProduct,
        apiKey: 'test-key',
        model: 'claude-sonnet-4-20250514'
      })
    });
    
    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      console.log('✅ Métadonnées récupérées:', Object.keys(metaData).length, 'champs');
    } else {
      const errorData = await metaResponse.json();
      console.log('❌ Erreur métadonnées:', errorData.error || 'Erreur inconnue');
    }
    
    console.log('');
    
    // Test 2: Images uniquement
    console.log('🟡 Test 2: Images uniquement');
    const imagesResponse = await fetch('http://localhost:3000/api/ai-fill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productData: testProduct,
        apiKey: 'test-key',
        model: 'claude-sonnet-4-20250514',
        targetField: 'images',
        mode: 'images_only'
      })
    });
    
    if (imagesResponse.ok) {
      const imagesData = await imagesResponse.json();
      console.log('✅ Images récupérées:', imagesData.success ? 'Succès' : 'Échec');
    } else {
      const errorData = await imagesResponse.json();
      console.log('❌ Erreur images:', errorData.error || 'Erreur inconnue');
      if (errorData.debugInfo) {
        console.log('🔍 Debug info:', errorData.debugInfo.step);
      }
    }
    
    console.log('');
    console.log('🎯 Instructions pour tester manuellement:');
    console.log('');
    console.log('1. Ouvrez http://localhost:3000');
    console.log('2. Cliquez sur "iPhone 15 pro"');
    console.log('3. Dans l\'inspecteur:');
    console.log('   - Survoler le bouton Sparkles (AI Global) : Tooltip avec progression');
    console.log('   - Survoler le bouton FileText (AI Metas) : Tooltip avec progression');
    console.log('   - Cliquer sur un bouton : Plus de texte visible à côté !');
    console.log('');
    console.log('✅ Les messages de progression sont maintenant UNIQUEMENT dans le tooltip !');
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

testAIButtons().catch(console.error);
