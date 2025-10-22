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
  compact?: boolean;
}

export default function ImageUploader({ 
  productId, 
  images, 
  onImagesChange, 
  maxImages = 10,
  compact = false
}: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const featuredImage = images.find(img => img.is_featured);
  const otherImages = images.filter(img => !img.is_featured);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <ImageIcon className="h-6 w-6 text-gray-300 animate-pulse mr-2" />
        <span className="text-sm text-gray-500">Chargement des images...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Zone d'upload compacte */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            {isUploading ? 'Upload en cours...' : 'Glissez-déposez ou cliquez'}
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF • Max 5MB • {maxImages} images
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Images en grille compacte */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`relative group rounded-lg overflow-hidden border-2 ${
                  image.is_featured ? 'border-yellow-400' : 'border-gray-200'
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOverReorder}
                onDrop={(e) => handleDropReorder(e, index)}
              >
                <img
                  src={image.url}
                  alt={image.file_name}
                  className="w-full h-20 object-cover"
                />
                
                {/* Overlay avec actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFeatured(image.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      {image.is_featured ? (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(image);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Indicateur featured */}
                {image.is_featured && (
                  <div className="absolute top-1 left-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  </div>
                )}

                {/* Handle de drag */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-3 w-3 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Version complète (non compacte)
  return (
    <div className="space-y-4">
      {/* Zone d'upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Glissez-déposez vos images ici
        </p>
        <p className="text-sm text-gray-600 mb-4">
          ou cliquez pour sélectionner des fichiers
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Upload en cours...' : 'Sélectionner des images'}
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          PNG, JPG, GIF jusqu'à 5MB • Max {maxImages} images
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Image featured */}
      {featuredImage && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            Image principale
          </h4>
          <div className="relative group">
            <img
              src={featuredImage.url}
              alt={featuredImage.file_name}
              className="w-full h-48 object-cover rounded-lg border-2 border-yellow-200"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteImage(featuredImage)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute top-2 left-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-yellow-100 hover:bg-yellow-200"
                disabled
              >
                <Star className="h-4 w-4 text-yellow-600 fill-current" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Autres images */}
      {otherImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Images supplémentaires ({otherImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {otherImages.map((image, index) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={image.file_name}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setFeatured(image.id)}
                      className="h-8 w-8 p-0"
                    >
                      <StarOff className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteImage(image)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message si aucune image */}
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>Aucune image ajoutée</p>
          <p className="text-sm">Ajoutez des images pour améliorer la visibilité du produit</p>
        </div>
      )}
    </div>
  );
}
