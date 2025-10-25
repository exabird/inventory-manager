'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, X, Save, Sparkles, Image as ImageIcon, Upload, Plus, Minus } from 'lucide-react';
import { Product, ProductFormData, Category, Brand } from '@/lib/supabase';
import { ProductService, CategoryService, BrandService } from '@/lib/services';
import { ProductImageService } from '@/lib/productImageService';
import { cn } from '@/lib/utils';
import TechnicalSpecsEditor from './TechnicalSpecsEditor';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ImageUploaderSquare from './ImageUploaderSquare';
import ProductThumbnail from './ProductThumbnail';
import UnifiedAIFetchButton, { AIFetchMode, AIFetchProgress } from './UnifiedAIFetchButton';

interface ProductInspectorProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onThumbnailChange?: () => void;
}

export default function ProductInspector({
  product,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  onThumbnailChange
}: ProductInspectorProps) {
  // États principaux
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    internal_ref: '',
    manufacturer: '',
    manufacturer_ref: '',
    barcode: '',
    brand: '',
    brand_id: null,
    category_id: null,
    quantity: 0,
    min_stock: 0,
    price: 0,
    description: '',
    long_description: '',
    technical_specifications: {},
    notes: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [thumbnailRefresh, setThumbnailRefresh] = useState(0);
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  
  // États pour nouveau produit
  const [productId, setProductId] = useState<string>('');
  const [isNewProduct, setIsNewProduct] = useState(false);

  // États pour AI fetch
  const [aiProgress, setAiProgress] = useState<AIFetchProgress>({
    mode: 'all',
    step: 'idle'
  });

  // Générer un UUID pour les nouveaux produits
  useEffect(() => {
    if (!product?.id && !productId) {
      const newId = crypto.randomUUID();
      setProductId(newId);
      setIsNewProduct(true);
    } else if (product?.id) {
      setProductId(product.id);
      setIsNewProduct(false);
    }
  }, [product?.id, productId]);

  // Charger les données initiales
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        internal_ref: product.internal_ref || '',
        manufacturer: product.manufacturer || '',
        manufacturer_ref: product.manufacturer_ref || '',
        barcode: product.barcode || '',
        brand: product.brand || '',
        brand_id: product.brand_id,
        category_id: product.category_id,
        quantity: product.quantity || 0,
        min_stock: product.min_stock || 0,
        price: product.price || 0,
        description: product.description || '',
        long_description: product.long_description || '',
        technical_specifications: product.technical_specifications || {},
        notes: product.notes || ''
      });
      setIsNewProduct(false);
    } else {
      setFormData({
        name: '',
        internal_ref: '',
        manufacturer: '',
        manufacturer_ref: '',
        barcode: '',
        brand: '',
        brand_id: null,
        category_id: null,
        quantity: 0,
        min_stock: 0,
        price: 0,
        description: '',
        long_description: '',
        technical_specifications: {},
        notes: ''
      });
      setIsNewProduct(true);
    }
    setHasChanges(false);
  }, [product]);

  // Charger les catégories et marques
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          CategoryService.getAll(),
          BrandService.getAll()
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error('❌ Erreur chargement données:', error);
      }
    };
    loadData();
  }, []);

  // Charger les images du produit
  useEffect(() => {
    if (!isNewProduct && productId) {
      const loadImages = async () => {
        try {
          const productImages = await ProductImageService.getByProductId(productId);
          const sortedImages = productImages.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          setImages(sortedImages);
        } catch (error) {
          console.error('❌ Erreur chargement images:', error);
        }
      };
      loadImages();
    } else {
      setImages([]);
    }
  }, [productId, isNewProduct]);

  // Polling pour les mises à jour en temps réel (seulement pendant un fetch IA actif)
  useEffect(() => {
    if (!isNewProduct && productId && aiProgress.step !== 'idle' && !hasChanges) {
      const interval = setInterval(async () => {
        try {
          const updatedProduct = await ProductService.getById(productId);
          if (updatedProduct) {
            setFormData(prev => ({
              ...prev,
              name: updatedProduct.name || prev.name,
              internal_ref: updatedProduct.internal_ref || prev.internal_ref,
              manufacturer: updatedProduct.manufacturer || prev.manufacturer,
              manufacturer_ref: updatedProduct.manufacturer_ref || prev.manufacturer_ref,
              barcode: updatedProduct.barcode || prev.barcode,
              brand: updatedProduct.brand || prev.brand,
              brand_id: updatedProduct.brand_id || prev.brand_id,
              category_id: updatedProduct.category_id || prev.category_id,
              quantity: updatedProduct.quantity || prev.quantity,
              min_stock: updatedProduct.min_stock || prev.min_stock,
              price: updatedProduct.price || prev.price,
              description: updatedProduct.description || prev.description,
              long_description: updatedProduct.long_description || prev.long_description,
              technical_specifications: updatedProduct.technical_specifications || prev.technical_specifications,
              notes: updatedProduct.notes || prev.notes
            }));
          }
        } catch (error) {
          console.error('❌ Erreur polling produit:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [productId, isNewProduct, aiProgress.step, hasChanges]);

  // Polling pour les images (seulement pendant un fetch IA actif)
  useEffect(() => {
    if (!isNewProduct && productId && aiProgress.step !== 'idle' && !hasChanges) {
      const interval = setInterval(async () => {
        try {
          const productImages = await ProductImageService.getByProductId(productId);
          const sortedImages = productImages.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          setImages(sortedImages);
        } catch (error) {
          console.error('❌ Erreur polling images:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [productId, isNewProduct, aiProgress.step, hasChanges]);

  // Gestion des changements
  const handleInputChange = useCallback((field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handleTechnicalSpecsChange = useCallback((specs: Record<string, any>) => {
    setFormData(prev => ({ ...prev, technical_specifications: specs }));
    setHasChanges(true);
  }, []);

  const handleLongDescriptionChange = useCallback((content: string) => {
    setFormData(prev => ({ ...prev, long_description: content }));
    setHasChanges(true);
  }, []);

  // Fonction unifiée pour le fetch IA
  const handleUnifiedAIFetch = async (mode: AIFetchMode) => {
    try {
      setAiProgress({ mode, step: 'idle' }); // Reset progress for new fetch

      if (mode === 'metas') {
        await fetchMetasOnly();
      } else if (mode === 'images') {
        await fetchImagesOnly();
      } else if (mode === 'all') {
        await fetchMetasOnly();
        await fetchImagesOnly();
      }

      setAiProgress(prev => ({ ...prev, step: 'complete' }));
      setTimeout(() => setAiProgress({ mode: 'all', step: 'idle' }), 3000);

    } catch (error: any) {
      console.error('❌ [Unified AI Fetch] Erreur:', error);
      setAiProgress(prev => ({
        ...prev,
        step: 'error',
        message: error.message || 'Erreur lors du fetch IA'
      }));
      setTimeout(() => setAiProgress({ mode: 'all', step: 'idle' }), 5000);
    }
  };

  // Fetch IA - Métadonnées uniquement
  const fetchMetasOnly = async () => {
    if (!formData.name || formData.name.trim() === '') {
      throw new Error('Veuillez saisir au moins un nom de produit pour lancer le fetch IA.');
    }

    setAiProgress(prev => ({ ...prev, step: 'fetching_metas' }));
    console.log('📝 [Fetch Metas] Début:', formData.name);

    const apiKey = localStorage.getItem('ai_api_key') || '';
    const model = localStorage.getItem('ai_model') || 'claude-sonnet-4-20250514';

    const response = await fetch('/api/ai-fill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productData: {
          id: productId,
          name: formData.name,
          brand: formData.brand,
          brand_id: formData.brand_id,
          manufacturer: formData.manufacturer,
          barcode: formData.barcode
        },
        apiKey,
        model
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors du fetch des métadonnées');
    }

    const metaData = await response.json();
    console.log('✅ [Fetch Metas] Réponse reçue');

    if (metaData.success && metaData.data) {
      const cleanedData = { ...metaData.data };
      delete cleanedData.category;

      // Filtrer pour ne garder QUE les champs vides
      const fieldsToUpdate: Partial<ProductFormData> = {};
      let metasCount = 0;

      Object.entries(cleanedData).forEach(([key, value]) => {
        const currentValue = formData[key as keyof ProductFormData];
        if ((!currentValue || currentValue === '') && value) {
          fieldsToUpdate[key as keyof ProductFormData] = value as any;
          metasCount++;
        }
      });

      if (Object.keys(fieldsToUpdate).length > 0) {
        setFormData(prev => ({ ...prev, ...fieldsToUpdate }));
        setAiProgress(prev => ({ ...prev, metasCount }));
        console.log(`✅ [Fetch Metas] ${metasCount} champs remplis`);
      } else {
        console.log('ℹ️ [Fetch Metas] Aucun champ vide à remplir');
      }
    }
  };

  // Fetch IA - Images uniquement
  const fetchImagesOnly = async () => {
    if (!formData.name || formData.name.trim() === '') {
      throw new Error('Veuillez saisir au moins un nom de produit pour lancer le fetch IA.');
    }

    setAiProgress(prev => ({ ...prev, step: 'fetching_images' }));
    console.log('📸 [Fetch Images] Début:', formData.name);

    const apiKey = localStorage.getItem('ai_api_key') || '';
    const model = localStorage.getItem('ai_model') || 'claude-sonnet-4-20250514';

    const imagesResponse = await fetch('/api/ai-fill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productData: {
          id: productId,
          name: formData.name,
          brand: formData.brand,
          brand_id: formData.brand_id,
          manufacturer: formData.manufacturer,
          barcode: formData.barcode
        },
        apiKey,
        model,
        targetField: 'images',
        mode: 'images_only'
      })
    });

    if (!imagesResponse.ok) {
      const errorData = await imagesResponse.json();
      throw new Error(errorData.error || 'Erreur lors du fetch des images');
    }

    await imagesResponse.json();
    console.log('✅ [Fetch Images] Images récupérées');

    // Classification des images
    let allImages = await ProductImageService.getByProductId(productId);
    if (allImages.length > 0) {
      console.log(`🎨 [Fetch Images] Classification de ${allImages.length} images...`);

      const classifyResponse = await fetch('/api/classify-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrls: allImages.map(img => img.url),
          productName: formData.name,
          apiKey,
          model,
          filterType: 'all'
        })
      });

      if (classifyResponse.ok) {
        const classifyData = await classifyResponse.json();
        console.log('✅ [Fetch Images] Classification terminée');

        // Supprimer les images "unwanted"
        for (const imageIndex of classifyData.unwanted || []) {
          try {
            const image = allImages.find(img => img.url === classifyData.imageUrls[imageIndex]);
            if (image) {
              await ProductImageService.delete(image.id);
              console.log(`🗑️ [Fetch Images] Image unwanted supprimée: ${imageIndex}`);
            }
          } catch (error) {
            console.warn('⚠️ Erreur suppression image:', error);
          }
        }
      }
    }

    // Recompter et configurer l'image principale
    allImages = await ProductImageService.getByProductId(productId);
    const imagesCount = allImages.length;

    const hasFeatured = allImages.some(img => img.is_featured);
    if (!hasFeatured && allImages.length > 0) {
      const firstProductImage = allImages.find(img => img.image_type === 'product');
      const imageToFeature = firstProductImage || allImages[0];
      await ProductImageService.update(imageToFeature.id, { is_featured: true });
      notifyThumbnailChange();
    }

    // Recharger les images dans l'UI
    const sortedImages = allImages.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setImages(sortedImages);

    setAiProgress(prev => ({ ...prev, imagesCount }));
    console.log(`✅ [Fetch Images] ${imagesCount} images traitées`);
  };

  // Notification de changement de thumbnail
  const notifyThumbnailChange = useCallback(() => {
    setThumbnailRefresh(prev => prev + 1);
    onThumbnailChange?.();
  }, [onThumbnailChange]);

  // Soumission du formulaire
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanedData = { ...formData };
      
      // Nettoyer les champs vides pour éviter les erreurs de contrainte unique
      if (!cleanedData.barcode || cleanedData.barcode.trim() === '') {
        delete cleanedData.barcode;
      }
      if (!cleanedData.internal_ref || cleanedData.internal_ref.trim() === '') {
        delete cleanedData.internal_ref;
      }

      // Pour les nouveaux produits, inclure l'ID généré
      if (isNewProduct) {
        cleanedData.id = productId;
      }

      await onSubmit(cleanedData);
      setHasChanges(false);
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Suppression du produit
  const handleDelete = async () => {
    if (!product?.id || !onDelete) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await onDelete(product.id);
        onClose();
      } catch (error) {
        console.error('❌ Erreur suppression:', error);
      }
    }
  };

  // Gestion des images
  const handleImageUpload = useCallback((newImages: any[]) => {
    setImages(prev => [...newImages, ...prev]);
    setHasChanges(true);
  }, []);

  const handleImageDelete = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setHasChanges(true);
  }, []);

  const handleImageUpdate = useCallback((imageId: string, updates: any) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ));
    setHasChanges(true);
  }, []);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            {formData.name || 'Nouveau produit'}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {/* 🚀 Bouton IA Unifié */}
            <UnifiedAIFetchButton
              onFetch={handleUnifiedAIFetch}
              progress={aiProgress}
              className="flex-shrink-0"
            />

            {/* Bouton supprimer */}
            {product && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            {/* Bouton fermer */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nom du produit"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_ref">Référence interne</Label>
              <Input
                id="internal_ref"
                value={formData.internal_ref}
                onChange={(e) => handleInputChange('internal_ref', e.target.value)}
                placeholder="REF-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricant</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="Nom du fabricant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer_ref">Référence fabricant</Label>
              <Input
                id="manufacturer_ref"
                value={formData.manufacturer_ref}
                onChange={(e) => handleInputChange('manufacturer_ref', e.target.value)}
                placeholder="Référence du fabricant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Code-barres</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                placeholder="Code-barres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marque</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Nom de la marque"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand_id">Marque (sélection)</Label>
              <Select
                value={formData.brand_id || ''}
                onValueChange={(value) => handleInputChange('brand_id', value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une marque" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      <div className="flex items-center gap-2">
                        {brand.ai_prompt && <Sparkles className="h-3 w-3 text-purple-500" />}
                        {brand.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Catégorie</Label>
              <Select
                value={formData.category_id || ''}
                onValueChange={(value) => handleInputChange('category_id', value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stock et prix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock">Stock minimum</Label>
              <Input
                id="min_stock"
                type="number"
                value={formData.min_stock}
                onChange={(e) => handleInputChange('min_stock', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          {/* Description courte */}
          <div className="space-y-2">
            <Label htmlFor="description">Description courte</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description courte du produit"
              rows={3}
            />
          </div>

          {/* Description longue */}
          <div className="space-y-2">
            <Label htmlFor="long_description">Description détaillée</Label>
            <RichTextEditor
              content={formData.long_description}
              onChange={handleLongDescriptionChange}
              placeholder="Description détaillée du produit..."
            />
          </div>

          {/* Spécifications techniques */}
          <div className="space-y-2">
            <Label>Spécifications techniques</Label>
            <TechnicalSpecsEditor
              specifications={formData.technical_specifications}
              onChange={handleTechnicalSpecsChange}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Images du produit</Label>
            <ImageUploaderSquare
              productId={productId}
              images={images}
              onImageUpload={handleImageUpload}
              onImageDelete={handleImageDelete}
              onImageUpdate={handleImageUpdate}
              onThumbnailChange={notifyThumbnailChange}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notes supplémentaires"
              rows={3}
            />
          </div>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={isLoading || !hasChanges}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isNewProduct ? 'Créer' : 'Sauvegarder'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}