'use client';

import { useState, useEffect } from 'react';
import { ProductService } from '@/lib/services';
import { Product } from '@/lib/supabase';

export default function ProductDebug() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('🔍 Debug: Chargement des produits...');
        setLoading(true);
        const data = await ProductService.getAll();
        console.log('🔍 Debug: Produits chargés:', data);
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('🔍 Debug: Erreur:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
        console.log('🔍 Debug: Loading terminé');
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
        <h3 className="font-bold text-yellow-800">Debug: Chargement...</h3>
        <p className="text-yellow-700">En cours de chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <h3 className="font-bold text-red-800">Debug: Erreur</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded">
      <h3 className="font-bold text-green-800">Debug: Succès</h3>
      <p className="text-green-700">
        {products.length} produit{products.length > 1 ? 's' : ''} chargé{products.length > 1 ? 's' : ''}
      </p>
      <div className="mt-2 space-y-1">
        {products.slice(0, 3).map((product) => (
          <div key={product.id} className="text-sm text-green-600">
            • {product.name} - Stock: {product.quantity}
          </div>
        ))}
        {products.length > 3 && (
          <div className="text-sm text-green-600">
            ... et {products.length - 3} autres
          </div>
        )}
      </div>
    </div>
  );
}

