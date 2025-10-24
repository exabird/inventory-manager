'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { ProductImageService, ProductImage } from '@/lib/productImageService';

interface ProductThumbnailProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fallbackIcon?: boolean;
  refreshTrigger?: number; // Pour forcer le rechargement
}

export default function ProductThumbnail({ 
  productId, 
  className = '', 
  size = 'md',
  fallbackIcon = true,
  refreshTrigger = 0
}: ProductThumbnailProps) {
  const [featuredImage, setFeaturedImage] = useState<ProductImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedImage();
  }, [productId, refreshTrigger]);

  const loadFeaturedImage = async () => {
    try {
      setIsLoading(true);
      const images = await ProductImageService.getByProductId(productId);
      const featured = images.find(img => img.is_featured) || images[0];
      setFeaturedImage(featured || null);
    } catch (error) {
      // Ne pas logger les erreurs si c'est juste qu'il n'y a pas d'images
      setFeaturedImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-100 rounded-lg flex items-center justify-center animate-pulse`}>
        <ImageIcon className={`${iconSizes[size]} text-gray-300`} />
      </div>
    );
  }

  if (!featuredImage) {
    if (!fallbackIcon) return null;
    
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <ImageIcon className={`${iconSizes[size]} text-gray-400`} />
      </div>
    );
  }

  return (
    <img
      src={featuredImage.url}
      alt={featuredImage.file_name}
      className={`${sizeClasses[size]} ${className} object-cover rounded-lg border border-gray-200`}
      onError={(e) => {
        // En cas d'erreur de chargement, afficher l'icône de fallback
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent && fallbackIcon) {
          parent.innerHTML = `
            <div class="${sizeClasses[size]} bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="${iconSizes[size]} text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          `;
        }
      }}
    />
  );
}
