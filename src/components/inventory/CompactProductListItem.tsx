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
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        iconColor: 'text-destructive'
      };
    } else if (product.quantity < 5) {
      return { 
        label: 'Stock faible', 
        variant: 'secondary' as const,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-500/10',
        iconColor: 'text-orange-600 dark:text-orange-400'
      };
    } else {
      return { 
        label: 'En stock', 
        variant: 'default' as const,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10',
        iconColor: 'text-green-600 dark:text-green-400'
      };
    }
  };

  const getFieldValue = (fieldKey: string) => {
    try {
      if (fieldKey.startsWith('metadata.')) {
        const metadataKey = fieldKey.replace('metadata.', '');
        const value = product.metadata?.[metadataKey];
        return value !== null && value !== undefined ? String(value) : '-';
      }
      
      const value = (product as any)[fieldKey];
      if (value === null || value === undefined) return '-';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    } catch (error) {
      return '-';
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div 
      className="hover:bg-muted/50 transition-colors duration-150 cursor-pointer border-b border-border last:border-b-0"
      onClick={() => onSelect(product)}
    >
      {/* Layout Mobile - Shadcn sobre */}
      <div className="block md:hidden p-3">
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <input 
            type="checkbox" 
            className="w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-ring flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Image produit */}
          <div className="flex-shrink-0">
            <ProductThumbnail 
              productId={product.id} 
              size="sm" 
              className="rounded-md border border-border w-12 h-12"
            />
          </div>

          {/* Informations produit */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-foreground truncate mb-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge 
                variant={product.quantity === 0 ? "destructive" : product.quantity < 5 ? "outline" : "default"}
                className="gap-1"
              >
                <Package className="h-3 w-3" />
                {product.quantity}
              </Badge>
              {product.manufacturer_ref && (
                <span className="text-xs text-muted-foreground truncate">#{product.manufacturer_ref}</span>
              )}
            </div>
          </div>

          {/* Prix et bouton */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="text-sm font-semibold text-foreground">
                {product.selling_price_htva?.toFixed(0) || '0'}€
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
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

      {/* Layout Desktop - Design Shadcn sobre */}
      <div className="hidden md:flex items-center gap-3 py-3 px-4 transition-colors cursor-pointer group relative">
        {/* Checkbox */}
        <div className="flex-shrink-0 w-4">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-ring cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Miniature produit */}
        <div className="flex-shrink-0 w-12">
          <ProductThumbnail 
            productId={product.id} 
            size="sm" 
            className="rounded-md border border-border w-12 h-12"
          />
        </div>

        {/* Nom du produit */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Référence fabricant - Shadcn sobre */}
        {columnVisibility.manufacturer_ref && (
          <div className="flex-shrink-0 w-24">
            <Badge variant="outline" className="font-mono text-xs">
              <Hash className="h-3 w-3 mr-1 text-muted-foreground" />
              {product.manufacturer_ref || '-'}
            </Badge>
          </div>
        )}

        {/* Catégorie - Badge Shadcn */}
        {columnVisibility.category && (
          <div className="flex-shrink-0 w-32">
            {product.categories?.name ? (
              <Badge variant="secondary">
                <Tag className="h-3 w-3 mr-1" />
                {product.categories.name}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">-</span>
            )}
          </div>
        )}

        {/* Marque - Badge sobre */}
        {columnVisibility.brand && (
          <div className="flex-shrink-0 w-24">
            {product.brand || product.manufacturer ? (
              <Badge variant="outline" className="text-xs">
                <Building2 className="h-3 w-3 mr-1" />
                {product.brand || product.manufacturer}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">-</span>
            )}
          </div>
        )}

        {/* Stock - Badge simple */}
        {columnVisibility.quantity && (
          <div className="flex-shrink-0 w-20 text-center">
            <Badge 
              variant={product.quantity === 0 ? "destructive" : product.quantity < 5 ? "outline" : "default"}
              className="gap-1"
            >
              <Package className="h-3 w-3" />
              {product.quantity}
            </Badge>
          </div>
        )}

        {/* Prix de vente - Simple */}
        {columnVisibility.selling_price_htva && (
          <div className="flex-shrink-0 w-24 text-right">
            {product.selling_price_htva ? (
              <div className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                <ArrowUpFromLine className="h-3 w-3 text-muted-foreground" />
                {product.selling_price_htva.toFixed(2)}€
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">-</span>
            )}
          </div>
        )}

        {/* Prix d'achat - Simple */}
        {columnVisibility.purchase_price_htva && (
          <div className="flex-shrink-0 w-24 text-right">
            {product.purchase_price_htva ? (
              <div className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <ArrowDownToLine className="h-3 w-3 text-muted-foreground" />
                {product.purchase_price_htva.toFixed(2)}€
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">-</span>
            )}
          </div>
        )}

        {/* Colonnes dynamiques - Shadcn sobre */}
        {Object.keys(columnVisibility)
          .filter(key => !['manufacturer_ref', 'category', 'quantity', 'selling_price_htva', 'purchase_price_htva', 'brand', 'warranty_period', 'min_stock_quantity'].includes(key))
          .filter(key => columnVisibility[key])
          .map(fieldKey => {
            const value = getFieldValue(fieldKey);
            const isMetadata = fieldKey.startsWith('metadata.');
            
            return (
              <div key={fieldKey} className="flex-shrink-0 w-24 text-center">
                {value !== '-' ? (
                  <Badge 
                    variant={isMetadata ? "secondary" : "outline"}
                    className="text-xs truncate max-w-full"
                    title={`${fieldKey}: ${value}`}
                  >
                    {value}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </div>
            );
          })}

        {/* Bouton modification stock - Shadcn sobre */}
        <div className="flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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