'use client';

import { useState } from 'react';
import { Package, Edit, Trash2, Plus, Minus, ChevronRight, Barcode, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProductListItemProps {
  product: Product & { categories?: { name: string } };
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onQuantityChange: (id: string, change: number) => void;
}

export default function ProductListItem({ product, onEdit, onDelete, onQuantityChange }: ProductListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStockStatus = () => {
    if (product.quantity === 0) {
      return { label: 'Rupture', variant: 'destructive' as const, color: 'text-red-600' };
    } else if (product.quantity < 5) {
      return { label: 'Stock faible', variant: 'secondary' as const, color: 'text-orange-600' };
    } else {
      return { label: 'En stock', variant: 'default' as const, color: 'text-green-600' };
    }
  };

  const stockStatus = getStockStatus();

  // Icône basée sur la catégorie ou le type de produit
  const getProductIcon = () => {
    if (product.categories?.name) {
      const category = product.categories.name.toLowerCase();
      if (category.includes('électronique') || category.includes('tech')) {
        return <Package className="h-5 w-5 text-blue-500" />;
      } else if (category.includes('vêtement') || category.includes('textile')) {
        return <Package className="h-5 w-5 text-purple-500" />;
      } else if (category.includes('alimentaire') || category.includes('food')) {
        return <Package className="h-5 w-5 text-green-500" />;
      }
    }
    return <Package className="h-5 w-5 text-gray-500" />;
  };

  return (
    <>
      <div className="flex items-center p-3 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
        {/* Icône/Vignette du produit */}
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mr-3">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            getProductIcon()
          )}
        </div>

        {/* Informations principales */}
        <div className="flex-1 min-w-0">
          {/* Nom du produit */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
            {product.categories && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {product.categories.name}
              </Badge>
            )}
          </div>

          {/* Détails secondaires */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {product.internal_ref && (
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <span className="truncate">{product.internal_ref}</span>
              </div>
            )}
            {product.barcode && (
              <div className="flex items-center gap-1">
                <Barcode className="h-3 w-3" />
                <span className="truncate">{product.barcode}</span>
              </div>
            )}
            {product.manufacturer && (
              <span className="truncate">{product.manufacturer}</span>
            )}
          </div>
        </div>

        {/* Informations de droite */}
        <div className="flex items-center gap-3">
          {/* Quantité avec indicateur de statut */}
          <div className="text-right">
            <div className={`text-lg font-bold ${stockStatus.color}`}>
              {product.quantity}
            </div>
            <div className="text-xs text-gray-500">qté</div>
          </div>

          {/* Contrôles de quantité compacts */}
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0"
              onClick={() => onQuantityChange(product.id, 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0"
              onClick={() => onQuantityChange(product.id, -1)}
              disabled={product.quantity === 0}
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(product)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <ChevronRight className="h-4 w-4 text-gray-400 ml-1" />
          </div>
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{product.name}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(product.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
