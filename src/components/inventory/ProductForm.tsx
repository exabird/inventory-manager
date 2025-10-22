'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product, Category } from '@/lib/supabase';
import { CategoryService } from '@/lib/services';

// Interface simplifiée pour les données du formulaire
interface ProductFormData {
  barcode: string;
  name: string;
  manufacturer?: string;
  internal_ref?: string;
  quantity: number;
  category_id?: string;
  image_url?: string;
  notes?: string;
}

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
  const [formData, setFormData] = useState<ProductFormData>({
    barcode: barcode || product?.barcode || '',
    name: product?.name || '',
    manufacturer: product?.manufacturer || '',
    internal_ref: product?.internal_ref || '',
    quantity: product?.quantity || 0,
    category_id: product?.category_id || '',
    image_url: product?.image_url || '',
    notes: product?.notes || '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const cats = await CategoryService.getAll();
        setCategories(cats);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.internal_ref || formData.internal_ref.trim() === '') {
      errors.internal_ref = 'La référence interne est requise';
    }
    
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Le nom du produit est requis';
    }
    
    if (formData.quantity < 0) {
      errors.quantity = 'La quantité ne peut pas être négative';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (!validateForm()) {
      console.log('❌ Validation échouée:', validationErrors);
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Code-barres */}
      <div className="space-y-2">
        <Label htmlFor="barcode">Code-barres / QR Code</Label>
        <Input
          id="barcode"
          value={formData.barcode}
          onChange={(e) => handleInputChange('barcode', e.target.value)}
          placeholder="1234567890123"
          disabled={!!product}
        />
      </div>

      {/* Nom */}
      <div className="space-y-2">
        <Label htmlFor="name">Nom du produit *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Ex: iPhone 15 Pro"
          className={validationErrors.name ? 'border-red-500' : ''}
        />
        {validationErrors.name && (
          <p className="text-sm text-red-600">{validationErrors.name}</p>
        )}
      </div>

      {/* Fabricant */}
      <div className="space-y-2">
        <Label htmlFor="manufacturer">Fabricant</Label>
        <Input
          id="manufacturer"
          value={formData.manufacturer || ''}
          onChange={(e) => handleInputChange('manufacturer', e.target.value)}
          placeholder="Ex: Apple"
        />
      </div>

      {/* Référence interne */}
      <div className="space-y-2">
        <Label htmlFor="internal_ref">Référence interne *</Label>
        <Input
          id="internal_ref"
          value={formData.internal_ref || ''}
          onChange={(e) => handleInputChange('internal_ref', e.target.value)}
          placeholder="Ex: REF-12345"
          className={validationErrors.internal_ref ? 'border-red-500' : ''}
        />
        {validationErrors.internal_ref && (
          <p className="text-sm text-red-600">{validationErrors.internal_ref}</p>
        )}
      </div>

      {/* Quantité */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantité en stock</Label>
        <Input
          id="quantity"
          type="number"
          value={formData.quantity}
          onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
          placeholder="0"
          min="0"
          className={validationErrors.quantity ? 'border-red-500' : ''}
        />
        {validationErrors.quantity && (
          <p className="text-sm text-red-600">{validationErrors.quantity}</p>
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
          <select
            id="category_id"
            value={formData.category_id || ''}
            onChange={(e) => handleInputChange('category_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Aucune catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* URL de l'image */}
      <div className="space-y-2">
        <Label htmlFor="image_url">URL de l'image</Label>
        <Input
          id="image_url"
          value={formData.image_url || ''}
          onChange={(e) => handleInputChange('image_url', e.target.value)}
          placeholder="https://example.com/image.jpg"
          type="url"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Informations supplémentaires..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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


