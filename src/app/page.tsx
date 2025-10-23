'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Camera, Package, Loader2, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { ProductService } from '@/lib/services';
import ProductCard from '@/components/inventory/ProductCard';
import CompactProductList from '@/components/inventory/CompactProductList';
import ProductInspector from '@/components/inventory/ProductInspector';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import ClientOnly from '@/components/ui/ClientOnly';

// Interface pour les données du formulaire
interface ProductFormData {
  barcode: string | null;
  name: string;
  manufacturer: string | null;
  internal_ref: string | null;
  quantity: number;
  category_id: string | null;
  image_url: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  // Nouvelles données essentielles
  manufacturer_ref: string | null;
  brand: string | null;
  short_description: string | null;
  selling_price_htva: number | null;
  purchase_price_htva: number | null;
  warranty_period: string | null;
  min_stock_required: boolean | null;
  min_stock_quantity: number | null;
}
import { APP_VERSION } from '@/lib/version';

export default function Home() {
  // États de base avec données simulées pour tester les améliorations
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Sonos Beam',
      quantity: 15,
      barcode: '9876543210125',
      manufacturer: 'Sonos',
      internal_ref: 'SONOS-BEAM',
      category_id: 'audio',
      image_url: null,
      notes: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      manufacturer_ref: 'SONOS-BEAM',
      brand: 'Sonos',
      short_description: 'Barre de son intelligente',
      selling_price_htva: 449.00,
      purchase_price_htva: 325.00,
      warranty_period: '2 ans',
      min_stock_required: true,
      min_stock_quantity: 5,
      categories: { name: 'Audio' }
    },
    {
      id: '2',
      name: 'Sonos One SL',
      quantity: 2, // Stock faible pour tester la couleur orange
      barcode: null,
      manufacturer: 'Sonos',
      internal_ref: 'SONOS-ONE-SL',
      category_id: 'audio',
      image_url: null,
      notes: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      manufacturer_ref: 'SONOS-ONE-SL',
      brand: 'Sonos',
      short_description: 'Enceinte sans micro',
      selling_price_htva: 179.00,
      purchase_price_htva: 130.00,
      warranty_period: '2 ans',
      min_stock_required: true,
      min_stock_quantity: 3,
      categories: { name: 'Audio' }
    },
    {
      id: '3',
      name: 'Sonos Five',
      quantity: 0, // Rupture de stock pour tester la couleur rouge
      barcode: null,
      manufacturer: 'Sonos',
      internal_ref: 'SONOS-FIVE',
      category_id: 'audio',
      image_url: null,
      notes: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      manufacturer_ref: 'SONOS-FIVE',
      brand: 'Sonos',
      short_description: 'Enceinte haut de gamme',
      selling_price_htva: 499.00,
      purchase_price_htva: 365.00,
      warranty_period: '2 ans',
      min_stock_required: true,
      min_stock_quantity: 2,
      categories: { name: 'Audio' }
    }
  ] as any);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading] = useState(false);

  // Filtrer les produits avec recherche améliorée
  const filteredProducts = products.filter(product => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    
    // Recherche dans tous les champs pertinents
    const searchableFields = [
      product.name,
      product.barcode,
      product.manufacturer,
      product.internal_ref,
      product.manufacturer_ref,
      product.brand,
      product.short_description,
      product.categories?.name,
      // Recherche dans les métadonnées
      ...Object.values(product.metadata || {}).map(v => String(v))
    ].filter(Boolean);
    
    return searchableFields.some(field => 
      String(field).toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Inventory Manager</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Chargement des produits...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'Aucun résultat' : 'Aucun produit'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Essayez une autre recherche'
                : 'Commencez par ajouter un produit'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                {searchQuery && ' trouvé' + (filteredProducts.length > 1 ? 's' : '')}
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  Effacer
                </Button>
              )}
            </div>

            {/* Liste de produits avec filtres et colonnes */}
            <CompactProductList
              products={filteredProducts}
              onProductSelect={(product) => {
                console.log('Produit sélectionné:', product.name);
                // TODO: Ouvrir l'inspecteur de produit
              }}
              onStockEdit={(product) => {
                console.log('Modification stock:', product.name);
                // TODO: Ouvrir le wizard de stock
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </>
        )}
      </div>
    </main>
  );
}
