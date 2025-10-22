'use client';

import { Package, Plus, Minus } from 'lucide-react';
import ProductThumbnail from '@/components/inventory/ProductThumbnail';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/supabase';

interface ProductCardProps {
  product: Product & { categories?: { name: string } };
  onEdit: (product: Product) => void;
  onQuantityChange: (id: string, change: number) => void;
}

export default function ProductCard({ product, onEdit, onQuantityChange }: ProductCardProps) {

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
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => onEdit(product)}
    >
      {/* Image du produit */}
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <ProductThumbnail 
          productId={product.id} 
          size="lg" 
          className="w-full h-full object-cover"
        />
        {/* Badge de statut */}
        <div className="absolute top-2 right-2">
          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
        </div>
      </div>

      {/* Contenu */}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </CardTitle>
        <div className="space-y-1 text-sm text-gray-600">
          {product.manufacturer && (
            <p className="line-clamp-1">
              <span className="font-medium">Fabricant:</span> {product.manufacturer}
            </p>
          )}
          {product.barcode && (
            <p>
              <span className="font-medium">Code-barres:</span> {product.barcode}
            </p>
          )}
          {product.internal_ref && (
            <p>
              <span className="font-medium">Réf:</span> {product.internal_ref}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Catégorie */}
        {product.categories && (
          <Badge variant="outline" className="mb-3">
            {product.categories.name}
          </Badge>
        )}

        {/* Quantité */}
        <div 
          className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm font-medium">Quantité:</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onQuantityChange(product.id, -1)}
              disabled={product.quantity === 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xl font-bold min-w-[3rem] text-center">
              {product.quantity}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onQuantityChange(product.id, 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notes */}
        {product.notes && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2 italic">
            &ldquo;{product.notes}&rdquo;
          </p>
        )}
      </CardContent>
    </Card>
  );
}


