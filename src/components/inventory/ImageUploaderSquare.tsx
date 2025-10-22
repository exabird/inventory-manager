'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Star, StarOff, Image as ImageIcon, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase, STORAGE_BUCKETS, getImageUrl } from '@/lib/supabase';
import { ProductImageService, ProductImage } from '@/lib/productImageService';

interface ImageUploaderProps {
  productId?: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ 
  productId, 
  images, 
  onImagesChange, 
  maxImages = 10
}: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Charger les images existantes au montage du composant
  useEffect(() => {
    if (productId) {
      loadExistingImages();
    }
  }, [productId]);

  const loadExistingImages = async () => {
    if (!productId) return;
    
    try {
      setIsLoading(true);
      console.log('📸 Chargement des images existantes pour le produit:', productId);
      
      const existingImages = await ProductImageService.getByProductId(productId);
      console.log('✅ Images chargées:', existingImages.length);
      
      onImagesChange(existingImages);
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
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
      console.error('❌ Erreur upload Supabase:', uploadError);
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
          console.error(`Erreur pour le fichier ${file.name}:`, fileError);
          // Continuer avec les autres fichiers même si un échoue
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
        console.log(`✅ ${newImages.length} image(s) uploadée(s) avec succès`);
        
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
      console.error('Erreur générale lors de l\'upload:', error);
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
      console.log('🗑️ Suppression image:', imageToDelete.id);
      
      // Supprimer de Supabase Storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
        .remove([imageToDelete.storage_path]);

      if (storageError) {
        console.error('Erreur suppression storage:', storageError);
      }

      // Supprimer de la base de données
      await ProductImageService.delete(imageToDelete.id);
      console.log('✅ Image supprimée de la base de données');

      // Mettre à jour la liste locale
      const updatedImages = images.filter(img => img.id !== imageToDelete.id);
      
      // Si on supprime l'image featured, faire de la première image la nouvelle featured
      if (imageToDelete.is_featured && updatedImages.length > 0) {
        await ProductImageService.setFeatured(imageToDelete.product_id, updatedImages[0].id);
        updatedImages[0].is_featured = true;
      }

      onImagesChange(updatedImages);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
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
      console.log('✅ Image featured mise à jour');
    } catch (error) {
      console.error('Erreur lors de la définition featured:', error);
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

  return (
    <div className="space-y-3">
      {/* Container avec scroll horizontal */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ scrollbarWidth: 'thin' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Images existantes */}
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`relative group flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
              image.is_featured ? 'border-yellow-400 shadow-md' : 'border-gray-200'
            } ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOverReorder}
            onDrop={(e) => handleDropReorder(e, index)}
          >
            <img
              src={image.url}
              alt={image.file_name}
              className="w-full h-full object-cover"
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

        {/* Zone d'upload - même format carré */}
        {images.length < maxImages && (
          <div
            className={`flex-shrink-0 w-24 h-24 rounded-lg border-2 border-dashed transition-all cursor-pointer flex items-center justify-center ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-1"></div>
                <span className="text-xs text-gray-600">Upload...</span>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-500">Ajouter</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

    </div>
  );
}
