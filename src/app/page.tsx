'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Product } from '@/lib/supabase';
import { ProductService } from '@/lib/services';
import CompactProductList from '@/components/inventory/CompactProductList';
import ProductInspector from '@/components/inventory/ProductInspector';


export default function Home() {
  // États pour les données réelles de Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showInspector, setShowInspector] = useState(false);

  // Fonction pour charger les produits depuis Supabase
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Chargement des produits depuis Supabase...');
      
      const productsData = await ProductService.getAll();
      console.log('✅ Produits chargés depuis Supabase:', productsData.length);
      
      if (productsData.length > 0) {
        // Nettoyer les données pour éviter les erreurs de rendu
        const cleanedProducts = productsData.map(product => ({
          ...product,
          barcode: product.barcode || '',
          notes: product.notes || '',
          image_url: product.image_url || '',
          internal_ref: product.internal_ref || '',
          metadata: product.metadata || {},
          warranty_period: product.warranty_period || '',
          min_stock_required: product.min_stock_required || false,
          min_stock_quantity: product.min_stock_quantity || 0
        }));
        
        setProducts(cleanedProducts);
        console.log('📊 Données Supabase chargées et nettoyées avec succès');
      } else {
        console.log('📭 Aucun produit trouvé dans Supabase');
        setProducts([]);
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du chargement des produits:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les produits au montage du composant
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Fonction pour gérer la sélection de produit
  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowInspector(true);
  }, []);

  // Fonction pour fermer l'inspecteur
  const handleCloseInspector = useCallback(() => {
    setShowInspector(false);
    setSelectedProduct(null);
  }, []);

  // Fonction pour sauvegarder les modifications d'un produit
  const handleUpdateProduct = useCallback(async (data: any) => {
    try {
      console.log('💾 [page.tsx] Début handleUpdateProduct');
      
      if (selectedProduct) {
        // ✅ MISE À JOUR d'un produit existant
        console.log('✏️ [page.tsx] Mise à jour du produit:', selectedProduct.id);
        
        const updatedProduct = await ProductService.update(selectedProduct.id, data);
        
        if (updatedProduct) {
          console.log('✅ Produit mis à jour avec succès');
          
          // ✅ Mise à jour locale du produit dans la liste (pas de refresh complet)
          setProducts(prevProducts => 
            prevProducts.map(p => 
              p.id === selectedProduct.id ? updatedProduct : p
            )
          );
          
          // Mettre à jour le produit sélectionné dans l'inspecteur
          setSelectedProduct(updatedProduct);
          
          console.log('✅ Liste mise à jour localement (pas de glitch)');
        } else {
          console.error('❌ Erreur lors de la mise à jour du produit');
        }
      } else {
        // ✅ CRÉATION d'un nouveau produit
        console.log('➕ [page.tsx] Création d\'un nouveau produit');
        
        const newProduct = await ProductService.create(data);
        
        if (newProduct) {
          console.log('✅ Nouveau produit créé avec succès:', newProduct.id);
          
          // ✅ Ajouter le nouveau produit à la liste
          setProducts(prevProducts => [newProduct, ...prevProducts]);
          
          // Fermer l'inspecteur après création
          setShowInspector(false);
          setSelectedProduct(null);
          
          console.log('✅ Produit ajouté à la liste');
        } else {
          console.error('❌ Erreur lors de la création du produit');
        }
      }
    } catch (error) {
      console.error('❌ [page.tsx] Erreur lors de la sauvegarde:', error);
    }
  }, [selectedProduct]);

  // Fonction pour supprimer un produit
  const handleDeleteProduct = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Suppression du produit:', id);
      
      const success = await ProductService.delete(id);
      
      if (success) {
        console.log('✅ Produit supprimé avec succès');
        
        // Recharger la liste des produits
        await loadProducts();
        
        // Fermer l'inspecteur
        handleCloseInspector();
      } else {
        console.error('❌ Erreur lors de la suppression du produit');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
    }
  }, []);

  // Fonction de remplissage IA - IDENTIQUE à l'inspecteur
  const handleAIFill = useCallback(async (product: Product, onProgress?: (step: 'idle' | 'starting' | 'fetching_metadata' | 'scraping_images' | 'classifying_images' | 'complete' | 'error') => void): Promise<{ images: number; metas: number }> => {
    console.log('🎨 [AI Auto-Fill] Début remplissage automatique:', product.name);
    
    try {
      // Récupérer les paramètres AI depuis localStorage
      const savedSettings = localStorage.getItem('ai_settings');
      let apiKey = null;
      let model = 'claude-sonnet-4-20250514';
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        apiKey = settings.claudeApiKey;
        model = settings.model || model;
      }

      if (!apiKey) {
        alert('⚠️ Clé API Anthropic non configurée. Allez dans Paramètres.');
        throw new Error('API key not configured');
      }

      // ============================================
      // 1. REMPLISSAGE MÉTADONNÉES (comme inspecteur)
      // ============================================
      if (onProgress) onProgress('fetching_metadata');
      console.log('📝 [AI Auto-Fill] Étape 1/2 : Remplissage métadonnées...');
      
      const metaResponse = await fetch('/api/ai-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productData: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            brand_id: product.brand_id, // 🆕 ID de la marque pour prompt personnalisé
            manufacturer: product.manufacturer,
            barcode: product.barcode,
            manufacturer_ref: product.manufacturer_ref
          },
          apiKey,
          model
        })
      });

      if (!metaResponse.ok) {
        throw new Error('Erreur lors du remplissage des métadonnées');
      }

      const metaData = await metaResponse.json();
      console.log('✅ [AI Auto-Fill] Métadonnées récupérées');

      // ============================================
      // 2. RÉCUPÉRATION IMAGES (comme inspecteur)
      // ============================================
      if (onProgress) onProgress('scraping_images');
      console.log('📸 [AI Auto-Fill] Étape 2/2 : Récupération images...');
      
      const imagesResponse = await fetch('/api/ai-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productData: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            brand_id: product.brand_id, // 🆕 ID de la marque pour prompt personnalisé
            manufacturer: product.manufacturer,
            barcode: product.barcode
          },
          apiKey,
          model,
          targetField: 'images',
          mode: 'images_only'
        })
      });

      if (!imagesResponse.ok) {
        throw new Error('Erreur lors de la récupération des images');
      }

      const imagesData = await imagesResponse.json();
      console.log('✅ [AI Auto-Fill] Images récupérées');

      // ============================================
      // 3. CLASSIFICATION DES IMAGES (comme inspecteur)
      // ============================================
      if (onProgress) onProgress('classifying_images');
      console.log('🎨 [AI Auto-Fill] Classification des images...');

      // Recharger les images pour avoir le total
      const { ProductImageService } = await import('@/lib/productImageService');
      let allImages = await ProductImageService.getByProductId(product.id);

      // Classifier avec l'IA (toutes les images sans filtre lors du fetch auto)
      if (allImages.length > 0) {
        console.log(`🎨 [AI Auto-Fill] Classification de ${allImages.length} images...`);
        
        const classifyResponse = await fetch('/api/classify-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrls: allImages.map(img => img.url), // ✅ Envoyer URLs uniquement
            productName: product.name,
            apiKey,
            model,
            filterType: 'all' // Pas de filtre lors du fetch auto, on garde toutes les images
          })
        });

        if (classifyResponse.ok) {
          const classifyData = await classifyResponse.json();
          console.log('✅ [AI Auto-Fill] Classification reçue:', classifyData.analyses?.length, 'analyses');
          
          // Mettre à jour les types d'images (mapper par index)
          if (classifyData.analyses && Array.isArray(classifyData.analyses)) {
            for (const analysis of classifyData.analyses) {
              try {
                const imageIndex = analysis.index;
                const image = allImages[imageIndex];
                
                if (image) {
                  console.log(`🎨 [AI Auto-Fill] Image ${imageIndex}: ${analysis.type} (${analysis.confidence})`);
                  await ProductImageService.update(image.id, {
                    image_type: analysis.type,
                    ai_confidence: analysis.confidence,
                    ai_analysis: analysis.reason
                  });
                }
              } catch (error) {
                console.warn('⚠️ Erreur update image:', error);
              }
            }
          }

          // Supprimer les images "unwanted"
          const unwantedAnalyses = classifyData.analyses?.filter((a: any) => a.type === 'unwanted') || [];
          console.log(`🗑️ [AI Auto-Fill] Suppression de ${unwantedAnalyses.length} images unwanted`);
          
          for (const analysis of unwantedAnalyses) {
            try {
              const imageIndex = analysis.index;
              const image = allImages[imageIndex];
              
              if (image) {
                await ProductImageService.delete(image.id);
                console.log(`🗑️ [AI Auto-Fill] Image unwanted supprimée: ${imageIndex}`);
              }
            } catch (error) {
              console.warn('⚠️ Erreur suppression image:', error);
            }
          }
        } else {
          console.error('❌ [AI Auto-Fill] Erreur classification:', await classifyResponse.text());
        }
      }

      // Recompter après classification/suppression
      allImages = await ProductImageService.getByProductId(product.id);
      const totalImagesCount = allImages.length;

      // Définir la première image comme featured si aucune
      const hasFeatured = allImages.some(img => img.is_featured);
      if (!hasFeatured && allImages.length > 0) {
        const firstProductImage = allImages.find(img => img.image_type === 'product');
        const imageToFeature = firstProductImage || allImages[0];
        await ProductImageService.update(imageToFeature.id, { is_featured: true });
      }

      // ============================================
      // 4. MISE À JOUR DES MÉTADONNÉES
      // ============================================
      if (metaData.success && metaData.data) {
        const cleanedData = { ...metaData.data };
        delete cleanedData.category;
        
        const metasCount = Object.keys(cleanedData).filter(key => {
          const value = cleanedData[key as keyof typeof cleanedData];
          return value !== null && value !== '' && value !== undefined;
        }).length;

        const updatedProduct = await ProductService.update(product.id, cleanedData);
        console.log('✅ [AI Auto-Fill] Produit mis à jour');

        if (updatedProduct) {
          setProducts(prevProducts => 
            prevProducts.map(p => 
              p.id === product.id ? { ...p, ...updatedProduct } : p
            )
          );
        }

        console.log(`📈 [AI Auto-Fill] Résumé: ${totalImagesCount} images, ${metasCount} metas`);
        return { images: totalImagesCount, metas: metasCount };
      }

      return { images: totalImagesCount, metas: 0 };
    } catch (error) {
      console.error('❌ [AI Auto-Fill] Erreur:', error);
      throw error;
    }
  }, []);

  // Filtrer les produits avec recherche améliorée
  const filteredProducts = products.filter(product => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    
      // Recherche dans tous les champs pertinents
    const searchableFields = [
      product.name,
      product.barcode,
      product.manufacturer,
      product.internal_ref,
      product.manufacturer_ref,
      product.brand,
      product.short_description,
      (product as any).categories?.name,
      // Recherche dans les métadonnées
      ...Object.values(product.metadata || {}).map(v => String(v))
    ].filter(Boolean);
    
    return searchableFields.some(field => 
      String(field).toLowerCase().includes(query)
    );
  });

  return (
    <TooltipProvider>
      <main className="min-h-screen">
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Chargement des produits...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-20 w-20 text-muted mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {searchQuery ? 'Aucun résultat' : 'Aucun produit'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Essayez une autre recherche'
                  : 'Commencez par ajouter un produit'}
              </p>
            </div>
          ) : (
            <>
              {/* Liste de produits avec filtres et colonnes */}
              <CompactProductList
                products={filteredProducts}
                onProductSelect={handleSelectProduct}
                onStockEdit={(product) => {
                  console.log('Modification stock:', product.name);
                  // TODO: Ouvrir le wizard de stock
                }}
                onAIFill={handleAIFill}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </>
          )}
        </div>
      </main>

      {/* Inspecteur de produit */}
      <ProductInspector
        product={selectedProduct}
        isOpen={showInspector}
        onClose={handleCloseInspector}
        onSubmit={handleUpdateProduct}
        onDelete={handleDeleteProduct}
        onThumbnailChange={async () => {
          // Recharger le produit depuis Supabase pour avoir la miniature à jour
          if (selectedProduct?.id) {
            const updatedProduct = await ProductService.getById(selectedProduct.id);
            if (updatedProduct) {
              setProducts(prevProducts =>
                prevProducts.map(p =>
                  p.id === selectedProduct.id ? updatedProduct : p
                )
              );
            }
          }
        }}
      />

      {/* Bouton flottant pour ajouter un produit - Masqué quand l'inspecteur est ouvert */}
      {!showInspector && (
        <button
          onClick={() => {
            setSelectedProduct(null);
            setShowInspector(true);
          }}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 z-50 flex items-center justify-center"
          title="Ajouter un produit"
        >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
      )}
    </TooltipProvider>
  );
}
