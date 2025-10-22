'use client';

import { Package, Plus, Minus, ChevronRight, Barcode, Hash } from 'lucide-react';
import ProductThumbnail from '@/components/inventory/ProductThumbnail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Product } from '@/lib/supabase';

interface ProductListItemProps {
  product: Product & { categories?: { name: string } };
  onSelect: (product: Product) => void;
  onQuantityChange: (id: string, change: number) => void;
}

export default function ProductListItem({ 
  product, 
  onSelect, 
  onQuantityChange 
}: ProductListItemProps) {
  const getStockStatus = () => {
    if (product.quantity === 0) {
      return { label: 'Rupture', variant: 'destructive' as const };
    } else if (product.quantity < 5) {
      return { label: 'Stock faible', variant: 'secondary' as const };
    } else {
      return { label: 'En stock', variant: 'default' as const };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group border-0 border-b border-gray-100 rounded-none"
      onClick={() => onSelect(product)}
    >
      <div className="flex items-center p-4 hover:bg-gray-50/50 transition-colors">
        {/* Miniature du produit - plus grande et mieux intégrée */}
        <div className="flex-shrink-0 mr-4">
          <ProductThumbnail 
            productId={product.id} 
            size="md" 
            className="border border-gray-200 shadow-sm"
          />
        </div>

        {/* Informations du produit */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            <Badge 
              variant={stockStatus.variant}
              className="text-xs font-medium"
            >
              {stockStatus.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            {product.internal_ref && (
              <div className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-gray-400" />
                <span className="truncate font-medium">{product.internal_ref}</span>
              </div>
            )}
            {product.barcode && (
              <div className="flex items-center gap-1.5">
                <Barcode className="h-3.5 w-3.5 text-gray-400" />
                <span className="truncate">{product.barcode}</span>
              </div>
            )}
            {product.categories && (
              <span className="truncate text-gray-500">{product.categories.name}</span>
            )}
          </div>
        </div>

        {/* Contrôles de quantité */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 mb-1">
              {product.quantity}
            </div>
            <div className="text-xs text-gray-500 font-medium">qté</div>
          </div>
          
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 hover:bg-green-50 hover:border-green-300 hover:text-green-600"
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(product.id, 1);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(product.id, -1);
              }}
              disabled={product.quantity === 0}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </Card>
  );
}