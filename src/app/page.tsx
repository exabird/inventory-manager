'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    if (!selectedProduct) return;
    
    try {
      console.log('💾 [page.tsx] Début handleUpdateProduct');
      console.log('💾 [page.tsx] Données reçues:', data);
      console.log('💾 [page.tsx] selectedProduct.id:', selectedProduct.id);
      
      // Mettre à jour le produit dans Supabase
      const updatedProduct = await ProductService.update(selectedProduct.id, data);
      
      if (updatedProduct) {
        console.log('✅ Produit mis à jour avec succès');
        
        // Recharger la liste des produits
        await loadProducts();
        
        // Fermer l'inspecteur
        handleCloseInspector();
      } else {
        console.error('❌ Erreur lors de la mise à jour du produit');
      }
    } catch (error) {
      console.error('❌ [page.tsx] Erreur lors de la sauvegarde:', error);
    }
  }, [selectedProduct, loadProducts, handleCloseInspector]);

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
    <>
      <main className="min-h-screen">
        <div className="p-4">
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
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </>
          )}
        </div>
      </main>

      {/* Inspecteur de produit */}
      {showInspector && selectedProduct && (
        <ProductInspector
          product={selectedProduct}
          onClose={handleCloseInspector}
          onSubmit={handleUpdateProduct}
          onDelete={handleDeleteProduct}
        />
      )}
    </>
  );
}
