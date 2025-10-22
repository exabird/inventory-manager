'use client';

import { useState } from 'react';
import { Package, Edit, Trash2, Plus, Minus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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

interface ProductCardProps {
  product: Product & { categories?: { name: string } };
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onQuantityChange: (id: string, change: number) => void;
}

export default function ProductCard({ product, onEdit, onDelete, onQuantityChange }: ProductCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image du produit */}
        <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="h-16 w-16 text-gray-400" />
          )}
          {/* Badge de statut */}
          <div className="absolute top-2 right-2">
            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
          </div>
        </div>

        {/* Contenu */}
        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
          <div className="space-y-1 text-sm text-gray-600">
            {product.manufacturer && (
              <p className="line-clamp-1">
                <span className="font-medium">Fabricant:</span> {product.manufacturer}
              </p>
            )}
            <p>
              <span className="font-medium">Code-barres:</span> {product.barcode}
            </p>
            {product.internal_ref && (
              <p>
                <span className="font-medium">Réf:</span> {product.internal_ref}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {/* Catégorie */}
          {product.categories && (
            <Badge variant="outline" className="mb-3">
              {product.categories.name}
            </Badge>
          )}

          {/* Quantité */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
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
              "{product.notes}"
            </p>
          )}
        </CardContent>

        {/* Actions */}
        <CardFooter className="gap-2 pt-0">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(product)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Éditer
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

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

