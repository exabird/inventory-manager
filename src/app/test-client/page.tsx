'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestClient() {
  const [status, setStatus] = useState('Chargement...');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔍 Test de connexion Supabase côté client...');
        
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .limit(5);

        if (error) {
          console.warn('⚠️ Erreur Supabase (test):', error);
          setStatus(`Erreur: ${error.message}`);
          return;
        }

        console.log('✅ Connexion réussie:', data);
        setStatus(`Connexion réussie - ${data?.length || 0} produits trouvés`);
        setProducts(data || []);
      } catch (err) {
        console.warn('⚠️ Erreur générale (test):', err);
        setStatus(`Erreur générale: ${err}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Connexion Supabase Client</h1>
      <p className="mb-4">Status: {status}</p>
      
      {products.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Produits trouvés:</h2>
          <ul className="space-y-2">
            {products.map((product) => (
              <li key={product.id} className="border p-2 rounded">
                <strong>{product.name}</strong> - {product.quantity} unités
                {product.categories && (
                  <span className="text-gray-600"> ({product.categories.name})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
