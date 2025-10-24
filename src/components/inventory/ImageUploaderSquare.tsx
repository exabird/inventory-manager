'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Star, StarOff, Image as ImageIcon, Trash2, GripVertical, Sparkles, Loader2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase, STORAGE_BUCKETS, getImageUrl } from '@/lib/supabase';
import { ProductImageService, ProductImage } from '@/lib/productImageService';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ImageUploaderProps {
  productId?: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  maxImages?: number;
  onAIFillImages?: (filterType?: 'all' | 'product' | 'lifestyle') => void;
  isAILoadingImages?: boolean;
  imagesFeedback?: { message: string; count: number; size: string } | null;
  onFeaturedChange?: () => void;
}

export default function ImageUploader({ 
  productId, 
  images, 
  onImagesChange, 
  maxImages = 10,
  onAIFillImages,
  isAILoadingImages = false,
  imagesFeedback,
  onFeaturedChange
}: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [imageTypeFilter, setImageTypeFilter] = useState<'all' | 'product' | 'lifestyle' | 'other'>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Charger les images existantes au montage du composant
  useEffect(() => {
    if (productId) {
      loadExistingImages();
    }
  }, [productId]);
  
  // Debug compteurs et filtrage
  useEffect(() => {
    console.log('📊 [ImageUploader] État complet:', {
      imagesLength: images.length,
      imageTypes: images.map(img => ({
        id: img.id.substring(0, 8),
        type: img.image_type,
        url: img.url.substring(0, 50)
      })),
      filterActive: imageTypeFilter,
      productCount: images.filter(img => img.image_type === 'product').length,
      lifestyleCount: images.filter(img => img.image_type === 'lifestyle').length,
      otherCount: images.filter(img => img.image_type === 'other').length,
      nullCount: images.filter(img => !img.image_type || img.image_type === null).length,
      unwantedCount: images.filter(img => img.image_type === 'unwanted').length
    });
  }, [images, imageTypeFilter]);

  const loadExistingImages = async () => {
    if (!productId) return;
    
    try {
      setIsLoading(true);
      console.log('📸 Chargement des images existantes pour le produit:', productId);
      
      const existingImages = await ProductImageService.getByProductId(productId);
      console.log('✅ Images chargées:', existingImages.length);
      
      onImagesChange(existingImages);
    } catch (error) {
      console.warn('⚠️ Erreur lors du chargement des images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<ProductImage> => {
    console.log('🖼️ Début upload image:', file.name, file.size, file.type);
    
    if (!productId) {
      throw new Error('ID du produit requis pour sauvegarder l\'image');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${productId}/${fileName}`;

    console.log('📁 Chemin de stockage:', filePath);

    // Upload vers Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
      .upload(filePath, file);

    if (uploadError) {
      console.warn('⚠️ Erreur upload Supabase:', uploadError);
      throw new Error(`Erreur d'upload: ${uploadError.message}`);
    }

    console.log('✅ Upload réussi, génération URL...');
    const url = getImageUrl(filePath);
    console.log('🔗 URL générée:', url);
    
    // Sauvegarder en base de données
    const isFeatured = images.length === 0; // Première image = featured par défaut
    
    const imageData = {
      product_id: productId,
      storage_path: filePath,
      url,
      is_featured: isFeatured,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    };

    console.log('💾 Sauvegarde en base de données...');
    const savedImage = await ProductImageService.create(imageData);
    console.log('✅ Image sauvegardée:', savedImage.id);
    
    return savedImage;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB max
    );

    if (validFiles.length === 0) {
      alert('Aucun fichier image valide sélectionné (max 5MB)');
      return;
    }

    if (images.length + validFiles.length > maxImages) {
      alert(`Maximum ${maxImages} images autorisées`);
      return;
    }

    setIsUploading(true);
    
    try {
      const newImages: ProductImage[] = [];
      
      for (const file of validFiles) {
        try {
          const image = await uploadImage(file);
          newImages.push(image);
        } catch (fileError) {
          console.warn(`⚠️ Erreur pour le fichier ${file.name}:`, fileError);
          // Continuer avec les autres fichiers même si un échoue
        }
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        onImagesChange(updatedImages);
        console.log(`✅ ${newImages.length} image(s) uploadée(s) avec succès`);
        
        // Si c'est la première image, notifier le parent pour rafraîchir le thumbnail
        if (images.length === 0 && onFeaturedChange) {
          onFeaturedChange();
        }
        
        // Scroll vers la fin pour voir les nouvelles images
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
          }
        }, 100);
      } else {
        alert('Aucune image n\'a pu être uploadée. Vérifiez les logs de la console.');
      }
    } catch (error) {
      console.warn('⚠️ Erreur générale lors de l\'upload:', error);
      alert('Erreur lors de l\'upload des images. Vérifiez les logs de la console.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const deleteImage = async (imageToDelete: ProductImage) => {
    try {
      console.log('🗑️ [Delete] Avant suppression:', images.length, 'images');
      
      // Suppression optimiste : retirer immédiatement de l'UI
      const updatedImages = images.filter(img => img.id !== imageToDelete.id);
      
      console.log('🗑️ [Delete] Après filtrage:', updatedImages.length, 'images');
      console.log('🗑️ [Delete] Appel onImagesChange avec:', updatedImages.length, 'images');
      
      onImagesChange(updatedImages);
      
      console.log('🗑️ Suppression image:', imageToDelete.id);
      
      // ⚠️ IMPORTANT : Attendre la suppression BDD avant de continuer
      // Cela évite les bugs de synchronisation avec le polling
      try {
        await ProductImageService.delete(imageToDelete.id);
        console.log('✅ Image supprimée de la base de données');
      } catch (err) {
        console.error('❌ Erreur suppression BDD:', err);
      }
      
      // Supprimer de Supabase Storage en arrière-plan (moins critique)
      supabase.storage
        .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
        .remove([imageToDelete.storage_path])
        .then(() => console.log('✅ Image supprimée du storage'))
        .catch(err => console.warn('⚠️ Erreur suppression storage:', err));

      // Si on supprime l'image featured, faire de la première image la nouvelle featured
      if (imageToDelete.is_featured && updatedImages.length > 0) {
        updatedImages[0].is_featured = true;
        
        ProductImageService.setFeatured(imageToDelete.product_id, updatedImages[0].id)
          .then(() => {
            console.log('✅ Nouvelle featured définie');
            if (onFeaturedChange) {
              onFeaturedChange();
            }
          })
          .catch(err => console.warn('⚠️ Erreur définition featured:', err));
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la suppression:', error);
    }
  };

  const setFeatured = async (imageId: string) => {
    try {
      if (!productId) return;
      
      console.log('⭐ Définition image featured:', imageId);
      await ProductImageService.setFeatured(productId, imageId);
      
      const updatedImages = images.map(img => ({
        ...img,
        is_featured: img.id === imageId
      }));
      
      onImagesChange(updatedImages);
      
      // Notifier le parent pour rafraîchir le thumbnail
      if (onFeaturedChange) {
        onFeaturedChange();
      }
      
      console.log('✅ Image featured mise à jour');
    } catch (error) {
      console.warn('⚠️ Erreur lors de la définition featured:', error);
    }
  };

  // Drag & Drop pour réorganiser les images
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverReorder = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropReorder = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    onImagesChange(newImages);
    setDraggedIndex(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <ImageIcon className="h-6 w-6 text-gray-300 animate-pulse mr-2" />
        <span className="text-sm text-gray-500">Chargement des images...</span>
      </div>
    );
  }

  // Filtrer les images selon le type sélectionné
  const filteredImages = images.filter(img => {
    // Exclure les unwanted
    if (img.image_type === 'unwanted') return false;
    
    // Si "all", afficher toutes sauf unwanted (y compris NULL)
    if (imageTypeFilter === 'all') return true;
    
    // Sinon, filtrer par type exact
    return img.image_type === imageTypeFilter;
  });

  // Compter les images par type
  const productCount = images.filter(img => img.image_type === 'product').length;
  const lifestyleCount = images.filter(img => img.image_type === 'lifestyle').length;
  const otherCount = images.filter(img => img.image_type === 'other').length;
  const nullCount = images.filter(img => !img.image_type || img.image_type === null).length;
  const totalCount = images.filter(img => img.image_type !== 'unwanted').length;
  
  console.log('🔍 [ImageUploader] Filtrage:', {
    filterActive: imageTypeFilter,
    totalImages: images.length,
    filtered: filteredImages.length,
    productCount,
    lifestyleCount,
    otherCount,
    nullCount,
    totalCount
  });

  return (
    <div className="space-y-0.5">
      {/* Toggle de filtrage par type */}
      {images.length > 0 && (
        <ToggleGroup 
          type="single" 
          value={imageTypeFilter} 
          onValueChange={(value) => value && setImageTypeFilter(value as 'all' | 'product' | 'lifestyle' | 'other')}
        >
          <ToggleGroupItem value="all">
            Toutes ({totalCount}{nullCount > 0 ? ` dont ${nullCount} non classifiées` : ''})
          </ToggleGroupItem>
          <ToggleGroupItem value="product">
            Produit ({productCount})
          </ToggleGroupItem>
          <ToggleGroupItem value="lifestyle">
            Situation ({lifestyleCount})
          </ToggleGroupItem>
          <ToggleGroupItem value="other">
            Autres ({otherCount})
          </ToggleGroupItem>
        </ToggleGroup>
      )}
      
      {/* Container avec scroll horizontal */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ scrollbarWidth: 'thin' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Message si aucune image après filtrage */}
        {images.length > 0 && filteredImages.length === 0 && (
          <div className="flex items-center justify-center w-full h-[100px] text-gray-400 text-sm">
            Aucune image de ce type
          </div>
        )}
        
        {/* Images existantes */}
        {filteredImages.map((image, index) => (
          <div
            key={image.id}
            className={`relative group flex-shrink-0 w-[100px] h-[100px] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              image.is_featured 
                ? 'border-blue-400 shadow-md ring-1 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            } ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOverReorder}
            onDrop={(e) => handleDropReorder(e, index)}
          >
            <img
              src={image.url}
              alt={image.file_name}
              className="w-full h-full object-cover bg-white cursor-pointer select-none"
              onClick={() => {
                setLightboxIndex(index);
                setLightboxOpen(true);
              }}
              onError={(e) => {
                console.warn('⚠️ Erreur chargement image:', image.url);
                // Afficher un placeholder au lieu de masquer
                const target = e.currentTarget as HTMLImageElement;
                target.style.opacity = '0.3';
                target.style.filter = 'grayscale(100%)';
              }}
            />
            
            {/* Overlay avec actions - seulement au hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFeatured(image.id);
                  }}
                  className="h-6 w-6 p-0 hover:bg-white/20"
                >
                  {image.is_featured ? (
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  ) : (
                    <StarOff className="h-3 w-3 text-white" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(image);
                  }}
                  className="h-6 w-6 p-0 hover:bg-red-500/20"
                >
                  <Trash2 className="h-3 w-3 text-white" />
                </Button>
              </div>
            </div>

            {/* Indicateur featured - moderne */}
            {image.is_featured && (
              <div className="absolute top-1 left-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current drop-shadow-lg" />
              </div>
            )}

            {/* Handle de drag - moderne */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <GripVertical className="h-3 w-3 text-white drop-shadow-lg" />
            </div>
          </div>
        ))}

        {/* Bouton IA avec dropdown - même format carré */}
        {onAIFillImages && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isAILoadingImages}>
              <div
                className={`flex-shrink-0 w-[100px] h-[100px] rounded-lg border-2 transition-all duration-200 cursor-pointer flex items-center justify-center ${
                  isAILoadingImages
                    ? 'border-purple-300 bg-purple-50 opacity-50 pointer-events-none' 
                    : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50 hover:shadow-sm'
                }`}
              >
                {isAILoadingImages ? (
                  <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                    <ChevronDown className="h-3 w-3 text-purple-600" />
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Type d'images à récupérer</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAIFillImages && onAIFillImages('all')}>
                <div className="flex flex-col">
                  <span className="font-medium">Toutes les images</span>
                  <span className="text-xs text-gray-500">Produit, situation et détails</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAIFillImages && onAIFillImages('product')}>
                <div className="flex flex-col">
                  <span className="font-medium">Photos produit uniquement</span>
                  <span className="text-xs text-gray-500">Pack shots sur fond blanc</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAIFillImages && onAIFillImages('lifestyle')}>
                <div className="flex flex-col">
                  <span className="font-medium">Mises en situation</span>
                  <span className="text-xs text-gray-500">Photos lifestyle et décor</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Zone d'upload - même format carré */}
        {images.length < maxImages && (
          <div
            className={`flex-shrink-0 w-[100px] h-[100px] rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer flex items-center justify-center ${
              dragOver 
                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
          </div>
        )}
      </div>

      {/* Feedback visuel après récupération IA */}
      {imagesFeedback && (
        <div className={`mt-3 p-3 rounded-lg flex items-start gap-3 animate-fade-in ${
          imagesFeedback.count > 0 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex-shrink-0 mt-0.5">
            {imagesFeedback.count > 0 ? (
              <Sparkles className="h-4 w-4 text-green-600" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium whitespace-pre-line ${
              imagesFeedback.count > 0 ? 'text-green-900' : 'text-red-900'
            }`}>
              {imagesFeedback.message}
            </p>
            <p className={`text-xs mt-1 ${
              imagesFeedback.count > 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {imagesFeedback.count > 0 
                ? `${imagesFeedback.count} image(s) • ${imagesFeedback.size}` 
                : imagesFeedback.size
              }
            </p>
          </div>
        </div>
      )}

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {/* Image principale */}
            {filteredImages[lightboxIndex] && (
              <img
                src={filteredImages[lightboxIndex].url}
                alt={filteredImages[lightboxIndex].file_name}
                className="max-w-full max-h-full object-contain"
              />
            )}
            
            {/* Bouton précédent */}
            {lightboxIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
                onClick={() => setLightboxIndex(prev => Math.max(0, prev - 1))}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}
            
            {/* Bouton suivant */}
            {lightboxIndex < filteredImages.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
                onClick={() => setLightboxIndex(prev => Math.min(filteredImages.length - 1, prev + 1))}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}
            
            {/* Compteur */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm">
              {lightboxIndex + 1} / {filteredImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
