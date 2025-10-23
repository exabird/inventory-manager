'use client';

import { Package, Hash, Barcode, Building2, Tag, ArrowUpFromLine, ArrowDownToLine, Edit3 } from 'lucide-react';
import ProductThumbnail from '@/components/inventory/ProductThumbnail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/supabase';

interface CompactProductListItemProps {
  product: Product & { categories?: { name: string } };
  onSelect: (product: Product) => void;
  onStockEdit: (product: Product) => void;
}

export default function CompactProductListItem({ 
  product, 
  onSelect, 
  onStockEdit 
}: CompactProductListItemProps) {
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
    <div 
      className="flex items-center gap-3 py-3 px-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer group"
      onClick={() => onSelect(product)}
    >
      {/* Checkbox (pour sélection multiple future) */}
      <div className="flex-shrink-0">
        <input 
          type="checkbox" 
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Miniature produit */}
      <div className="flex-shrink-0">
        <ProductThumbnail 
          productId={product.id} 
          size="sm" 
          className="rounded border border-gray-200"
        />
      </div>

      {/* Nom du produit */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
      </div>

      {/* Référence fabricant */}
      <div className="flex-shrink-0 w-24">
        <div className="flex items-center gap-1">
          <Hash className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-500 truncate">
            {product.manufacturer_ref || '-'}
          </span>
        </div>
      </div>

      {/* Catégorie */}
      <div className="flex-shrink-0 w-32">
        <div className="flex items-center gap-1">
          <Tag className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-500 truncate">
            {product.categories?.name || '-'}
          </span>
        </div>
      </div>

      {/* Statut stock */}
      <div className="flex-shrink-0 w-20">
        <Badge 
          variant={stockStatus.variant}
          className="text-xs font-medium"
        >
          {stockStatus.label}
        </Badge>
      </div>

      {/* Stock */}
      <div className="flex-shrink-0 w-16 text-center">
        <div className="flex items-center justify-center gap-1">
          <Package className="h-3 w-3 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {product.quantity}
          </span>
        </div>
      </div>

      {/* Prix de vente */}
      <div className="flex-shrink-0 w-20 text-center">
        {product.selling_price_htva ? (
          <div className="flex items-center justify-center gap-1">
            <ArrowUpFromLine className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {product.selling_price_htva.toFixed(2)}€
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </div>

      {/* Prix d'achat */}
      <div className="flex-shrink-0 w-20 text-center">
        {product.purchase_price_htva ? (
          <div className="flex items-center justify-center gap-1">
            <ArrowDownToLine className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {product.purchase_price_htva.toFixed(2)}€
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </div>

      {/* Bouton modification stock */}
      <div className="flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            onStockEdit(product);
          }}
          title="Modifier le stock"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
