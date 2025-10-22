'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product, Category } from '@/lib/supabase';
import { CategoryService } from '@/lib/services';

// Schéma de validation Zod
const productSchema = z.object({
  barcode: z.string().min(1, 'Le code-barres est requis'),
  name: z.string().min(1, 'Le nom est requis').max(500),
  manufacturer: z.string().max(255).optional().or(z.literal('')),
  internal_ref: z.string().max(100).optional().or(z.literal('')),
  quantity: z.number().int().min(0, 'La quantité doit être positive'),
  category_id: z.string().optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  barcode?: string;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductForm({
  product,
  barcode,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      barcode: barcode || product?.barcode || '',
      name: product?.name || '',
      manufacturer: product?.manufacturer || '',
      internal_ref: product?.internal_ref || '',
      quantity: product?.quantity || 0,
      category_id: product?.category_id || '',
      image_url: product?.image_url || '',
      notes: product?.notes || '',
    },
  });

  const selectedCategoryId = watch('category_id');

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      const cats = await CategoryService.getAll();
      setCategories(cats);
      setIsLoadingCategories(false);
    };
    loadCategories();
  }, []);

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Code-barres */}
      <div className="space-y-2">
        <Label htmlFor="barcode">Code-barres / QR Code *</Label>
        <Input
          id="barcode"
          {...register('barcode')}
          placeholder="1234567890123"
          disabled={!!product} // Désactiver si mode édition
        />
        {errors.barcode && (
          <p className="text-sm text-red-600">{errors.barcode.message}</p>
        )}
      </div>

      {/* Nom */}
      <div className="space-y-2">
        <Label htmlFor="name">Nom du produit *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Ex: iPhone 15 Pro"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Fabricant */}
      <div className="space-y-2">
        <Label htmlFor="manufacturer">Fabricant</Label>
        <Input
          id="manufacturer"
          {...register('manufacturer')}
          placeholder="Ex: Apple"
        />
        {errors.manufacturer && (
          <p className="text-sm text-red-600">{errors.manufacturer.message}</p>
        )}
      </div>

      {/* Référence interne */}
      <div className="space-y-2">
        <Label htmlFor="internal_ref">Référence interne</Label>
        <Input
          id="internal_ref"
          {...register('internal_ref')}
          placeholder="Ex: REF-12345"
        />
        {errors.internal_ref && (
          <p className="text-sm text-red-600">{errors.internal_ref.message}</p>
        )}
      </div>

      {/* Quantité */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantité en stock *</Label>
        <Input
          id="quantity"
          type="number"
          {...register('quantity', { valueAsNumber: true })}
          placeholder="0"
          min="0"
        />
        {errors.quantity && (
          <p className="text-sm text-red-600">{errors.quantity.message}</p>
        )}
      </div>

      {/* Catégorie */}
      <div className="space-y-2">
        <Label htmlFor="category_id">Catégorie</Label>
        {isLoadingCategories ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <Select
            value={selectedCategoryId}
            onValueChange={(value) => setValue('category_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Aucune catégorie</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.category_id && (
          <p className="text-sm text-red-600">{errors.category_id.message}</p>
        )}
      </div>

      {/* URL de l'image */}
      <div className="space-y-2">
        <Label htmlFor="image_url">URL de l'image</Label>
        <Input
          id="image_url"
          {...register('image_url')}
          placeholder="https://example.com/image.jpg"
          type="url"
        />
        {errors.image_url && (
          <p className="text-sm text-red-600">{errors.image_url.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Informations supplémentaires..."
          rows={4}
        />
        {errors.notes && (
          <p className="text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Boutons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : product ? (
            'Mettre à jour'
          ) : (
            'Ajouter le produit'
          )}
        </Button>
      </div>
    </form>
  );
}


