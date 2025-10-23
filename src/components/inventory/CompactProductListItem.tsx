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
  columnVisibility: {
    manufacturer_ref: boolean;
    category: boolean;
    quantity: boolean;
    selling_price_htva: boolean;
    purchase_price_htva: boolean;
    brand: boolean;
    warranty_period: boolean;
    min_stock_quantity: boolean;
    [key: string]: boolean;
  };
}

export default function CompactProductListItem({ 
  product, 
  onSelect, 
  onStockEdit,
  columnVisibility
}: CompactProductListItemProps) {
  const getStockStatus = () => {
    if (product.quantity === 0) {
      return { 
        label: 'Rupture', 
        variant: 'destructive' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        iconColor: 'text-red-500'
      };
    } else if (product.quantity < 5) {
      return { 
        label: 'Stock faible', 
        variant: 'secondary' as const,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-500'
      };
    } else {
      return { 
        label: 'En stock', 
        variant: 'default' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        iconColor: 'text-green-500'
      };
    }
  };

  const getFieldValue = (fieldKey: string) => {
    if (fieldKey.startsWith('metadata.')) {
      const metadataKey = fieldKey.replace('metadata.', '');
      return product.metadata?.[metadataKey] || '-';
    }
    return (product as any)[fieldKey] || '-';
  };

  const stockStatus = getStockStatus();

  return (
    <div 
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onSelect(product)}
    >
      {/* Layout Mobile - Simple et efficace */}
      <div className="block md:hidden p-3">
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <input 
            type="checkbox" 
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Image produit */}
          <div className="flex-shrink-0">
            <ProductThumbnail 
              productId={product.id} 
              size="sm" 
              className="rounded border border-gray-200 w-10 h-10"
            />
          </div>

          {/* Informations produit */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${stockStatus.bgColor}`}>
                <Package className={`h-3 w-3 ${stockStatus.iconColor}`} />
                <span className={`text-xs font-semibold ${stockStatus.color}`}>
                  {product.quantity}
                </span>
              </div>
            </div>
          </div>

          {/* Prix et bouton */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {product.selling_price_htva?.toFixed(0) || '0'}€
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onStockEdit(product);
              }}
              title="Modifier le stock"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Layout Desktop */}
      <div className="hidden md:flex items-center gap-3 py-3 px-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer group">
        {/* Checkbox */}
        <div className="flex-shrink-0 w-4">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Miniature produit */}
        <div className="flex-shrink-0 w-12">
          <ProductThumbnail 
            productId={product.id} 
            size="sm" 
            className="rounded border border-gray-200 w-12 h-12"
          />
        </div>

        {/* Nom du produit */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Référence fabricant */}
        {columnVisibility.manufacturer_ref && (
          <div className="flex-shrink-0 w-24">
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 truncate">
                {product.manufacturer_ref || '-'}
              </span>
            </div>
          </div>
        )}

        {/* Catégorie */}
        {columnVisibility.category && (
          <div className="flex-shrink-0 w-32">
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 truncate">
                {product.categories?.name || '-'}
              </span>
            </div>
          </div>
        )}

        {/* Marque */}
        {columnVisibility.brand && (
          <div className="flex-shrink-0 w-24">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 truncate">
                {product.brand || '-'}
              </span>
            </div>
          </div>
        )}

        {/* Stock - Version améliorée avec icône et couleur */}
        {columnVisibility.quantity && (
          <div className="flex-shrink-0 w-16 text-center">
            <div className={`flex items-center justify-center gap-1 px-2 py-1 rounded-md ${stockStatus.bgColor}`}>
              <Package className={`h-3 w-3 ${stockStatus.iconColor}`} />
              <span className={`text-sm font-semibold ${stockStatus.color}`}>
                {product.quantity}
              </span>
            </div>
          </div>
        )}

        {/* Prix de vente */}
        {columnVisibility.selling_price_htva && (
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
        )}

        {/* Prix d'achat */}
        {columnVisibility.purchase_price_htva && (
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
        )}

        {/* Colonnes dynamiques */}
        {Object.keys(columnVisibility)
          .filter(key => !['manufacturer_ref', 'category', 'quantity', 'selling_price_htva', 'purchase_price_htva'].includes(key))
          .filter(key => columnVisibility[key])
          .map(fieldKey => (
            <div key={fieldKey} className="flex-shrink-0 w-20 text-center">
              <span className="text-xs text-gray-500 truncate">
                {getFieldValue(fieldKey)}
              </span>
            </div>
          ))}

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
    </div>
  );
}