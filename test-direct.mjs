// Test direct import du service
import { ProductService } from './src/lib/services.ts';

console.log('🧪 Test direct du service ProductService...\n');

try {
  const products = await ProductService.getAll();
  console.log('✅ Résultat:', products);
} catch (error) {
  console.error('❌ Erreur:', error);
}
