#!/usr/bin/env node
/**
 * Test rapide du système de fallback
 */

const fetch = require('node-fetch').default;

async function testFallbackSystem() {
  console.log('🔄 Test du système de fallback...\n');
  
  try {
    // Test avec un produit Apple (site souvent bloqué)
    const testProduct = {
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      manufacturer: 'Apple Inc.',
      barcode: '1234567890123'
    };
    
    console.log('📱 Test avec:', testProduct.name);
    console.log('🎯 Site fabricant: apple.com (souvent bloqué)');
    console.log('🔄 Fallback attendu: coolblue.be ou autres sites commerciaux\n');
    
    const response = await fetch('http://localhost:3000/api/ai-fill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productData: testProduct,
        apiKey: 'test-key', // Clé de test
        model: 'claude-sonnet-4-20250514',
        targetField: 'images',
        mode: 'images_only'
      })
    });
    
    const data = await response.json();
    
    if (data.debugInfo) {
      console.log('🔍 Debug Info:');
      console.log('  - Étape:', data.debugInfo.step);
      console.log('  - URL trouvée:', data.debugInfo.details?.urlFound);
      console.log('  - Fallback utilisé:', data.debugInfo.details?.fallbackUsed);
      console.log('  - URL fallback:', data.debugInfo.details?.fallbackUrl);
      
      if (data.debugInfo.details?.fallbackUsed) {
        console.log('\n✅ SUCCÈS: Fallback activé !');
        console.log('🎯 Site commercial utilisé:', data.debugInfo.details.fallbackUrl);
      } else {
        console.log('\n⚠️ Fallback non utilisé');
        console.log('📝 Raison:', data.debugInfo.error || 'Site fabricant accessible');
      }
    }
    
    console.log('\n🎯 Instructions pour tester manuellement:');
    console.log('1. Ouvrez http://localhost:3000');
    console.log('2. Cliquez sur "iPhone 15 pro"');
    console.log('3. Cliquez sur le bouton AI Global (Sparkles)');
    console.log('4. Surveillez les logs pour voir le fallback en action');
    console.log('5. Vérifiez que les images sont récupérées depuis un site commercial');
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

testFallbackSystem().catch(console.error);
