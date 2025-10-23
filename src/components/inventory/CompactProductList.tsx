'use client';

import { useState } from 'react';
import { Search, Filter, Package, Hash, Tag, ArrowUpFromLine, ArrowDownToLine, Edit3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CompactProductListItem from '@/components/inventory/CompactProductListItem';
import { Product } from '@/lib/supabase';

interface CompactProductListProps {
  products: (Product & { categories?: { name: string } })[];
  onProductSelect: (product: Product) => void;
  onStockEdit: (product: Product) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function CompactProductList({
  products,
  onProductSelect,
  onStockEdit,
  searchQuery,
  onSearchChange
}: CompactProductListProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header avec recherche et filtre */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Chercher un produit..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          
          {/* Bouton filtre */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtre
          </Button>
        </div>
      </div>

      {/* Header de colonnes */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3 py-2 px-4 text-xs font-medium text-gray-600 uppercase tracking-wide">
          {/* Checkbox */}
          <div className="w-4"></div>
          
          {/* Image */}
          <div className="w-12"></div>
          
          {/* Nom */}
          <div className="flex-1">Produit</div>
          
          {/* Référence fabricant */}
          <div className="w-24 flex items-center gap-1">
            <Hash className="h-3 w-3" />
            <span>Réf.</span>
          </div>
          
          {/* Catégorie */}
          <div className="w-32 flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>Catégorie</span>
          </div>
          
          {/* Statut */}
          <div className="w-20">Statut</div>
          
          {/* Stock */}
          <div className="w-16 flex items-center justify-center gap-1">
            <Package className="h-3 w-3" />
            <span>Stock</span>
          </div>
          
          {/* Prix vente */}
          <div className="w-20 flex items-center justify-center gap-1">
            <ArrowUpFromLine className="h-3 w-3" />
            <span>Vente</span>
          </div>
          
          {/* Prix achat */}
          <div className="w-20 flex items-center justify-center gap-1">
            <ArrowDownToLine className="h-3 w-3" />
            <span>Achat</span>
          </div>
          
          {/* Actions */}
          <div className="w-8"></div>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="max-h-[600px] overflow-y-auto">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Package className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-sm">Aucun produit trouvé</p>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par ajouter votre premier produit'}
            </p>
          </div>
        ) : (
          products.map((product) => (
            <CompactProductListItem
              key={product.id}
              product={product}
              onSelect={onProductSelect}
              onStockEdit={onStockEdit}
            />
          ))
        )}
      </div>

      {/* Footer avec statistiques */}
      {products.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{products.length} produit{products.length > 1 ? 's' : ''}</span>
            <div className="flex items-center gap-4">
              <span>Total stock: {products.reduce((sum, p) => sum + p.quantity, 0)}</span>
              <span>En stock: {products.filter(p => p.quantity > 0).length}</span>
              <span>Rupture: {products.filter(p => p.quantity === 0).length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
