'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Camera, Package, Loader2, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/lib/supabase';
import { ProductService } from '@/lib/services';
import ProductCard from '@/components/inventory/ProductCard';
import ProductListItem from '@/components/inventory/ProductListItem';
import ProductInspector from '@/components/inventory/ProductInspector';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import ClientOnly from '@/components/ui/ClientOnly';

// Interface pour les données du formulaire
interface ProductFormData {
  barcode: string | null;
  name: string;
  manufacturer: string | null;
  internal_ref: string | null;
  quantity: number;
  category_id: string | null;
  image_url: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  // Nouvelles données essentielles
  manufacturer_ref: string | null;
  brand: string | null;
  short_description: string | null;
  selling_price_htva: number | null;
  purchase_price_htva: number | null;
  warranty_period: string | null;
  min_stock_required: boolean | null;
  min_stock_quantity: number | null;
}
import { APP_VERSION } from '@/lib/version';

export default function Home() {
  // États
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeFilter, setActiveFilter] = useState<'all' | 'low-stock' | 'out-of-stock' | 'in-stock'>('all');

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Chargement des produits...');
      const data = await ProductService.getAll();
      console.log('✅ Produits charges:', data.length, data);
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des produits:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
      console.log('✅ isLoading mis a false');
    }
  }, []);

  // Charger les produits au montage
  useEffect(() => {
    console.log('🚀 useEffect montage - Appel de loadProducts()');
    loadProducts();
  }, [loadProducts]);

  // Filtrer les produits lors de la recherche et par statut
  useEffect(() => {
    let filtered = products;

    // Filtre par recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.barcode?.toLowerCase().includes(query) ||
          p.manufacturer?.toLowerCase().includes(query) ||
          p.internal_ref?.toLowerCase().includes(query)
      );
    }

    // Filtre par statut de stock
    switch (activeFilter) {
      case 'low-stock':
        filtered = filtered.filter(product => product.quantity > 0 && product.quantity < 5);
        break;
      case 'out-of-stock':
        filtered = filtered.filter(product => product.quantity === 0);
        break;
      case 'in-stock':
        filtered = filtered.filter(product => product.quantity >= 5);
        break;
      case 'all':
      default:
        // Pas de filtre supplémentaire
        break;
    }

    setFilteredProducts(filtered);
  }, [searchQuery, products, activeFilter]);

  const handleScanSuccess = async (barcode: string) => {
    try {
      console.log('Code scanné:', barcode);
      setShowScanner(false);
      
      // Vérifier si le produit existe déjà
      const existingProduct = await ProductService.getByBarcode(barcode);
      
      if (existingProduct) {
        // Produit existe → proposer d'éditer
        console.log('Produit existant trouvé:', existingProduct.name);
        setEditingProduct(existingProduct);
        setScannedBarcode(null); // Clear scanned barcode for existing product
        setShowProductForm(true);
      } else {
        // Nouveau produit → formulaire avec code-barres pré-rempli
        console.log('Nouveau produit à créer');
        setScannedBarcode(barcode);
        setEditingProduct(null); // Clear editing product for new product
        setShowProductForm(true);
      }
    } catch (error) {
      console.error('Erreur lors du traitement du scan:', error);
      // En cas d'erreur, créer un nouveau produit avec le code scanné
      setScannedBarcode(barcode);
      setEditingProduct(null);
      setShowProductForm(true);
    }
  };

  const handleAddProduct = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      console.log('Enregistrement du produit:', data);
      
      // Validation des champs requis
      if (!data.internal_ref || data.internal_ref.trim() === '') {
        throw new Error('La référence interne est requise');
      }
      if (!data.name || data.name.trim() === '') {
        throw new Error('Le nom du produit est requis');
      }
      
      if (editingProduct) {
        // Mise à jour
        console.log('Mise à jour du produit existant:', editingProduct.id);
        const updatedProduct = await ProductService.update(editingProduct.id, data);
        
        if (updatedProduct) {
          setSuccessMessage('Produit mis à jour avec succès !');
          
          // Mettre à jour localement la liste des produits
          setProducts(prevProducts => 
            prevProducts.map(product => 
              product.id === editingProduct.id ? { ...product, ...updatedProduct } : product
            )
          );
          
          // Mettre à jour le produit en cours d'édition
          setEditingProduct(updatedProduct);
        } else {
          throw new Error('Erreur lors de la mise à jour du produit');
        }
      } else {
        // Création
        console.log('Création d\'un nouveau produit');
        const newProduct = await ProductService.create({
          ...data,
          barcode: data.barcode || null,
          manufacturer: data.manufacturer || null,
          internal_ref: data.internal_ref || null,
          category_id: data.category_id || null,
          image_url: data.image_url || null,
          notes: data.notes || null,
          metadata: {},
          // Nouveaux champs
          manufacturer_ref: data.manufacturer_ref,
          brand: data.brand,
          short_description: data.short_description,
          selling_price_htva: data.selling_price_htva,
          purchase_price_htva: data.purchase_price_htva,
          warranty_period: data.warranty_period,
          min_stock_required: data.min_stock_required,
          min_stock_quantity: data.min_stock_quantity,
        });
        
        if (newProduct) {
          setSuccessMessage('Produit ajouté avec succès !');
          
          // Ajouter le nouveau produit à la liste localement
          setProducts(prevProducts => [newProduct, ...prevProducts]);
        } else {
          throw new Error('Erreur lors de la création du produit');
        }
      }
      
      // Fermer le formulaire seulement pour les nouveaux produits
      if (!editingProduct) {
        setTimeout(() => {
          setShowProductForm(false);
          setScannedBarcode(null);
          setEditingProduct(null);
          setSuccessMessage(null);
        }, 1500); // Délai pour voir le message de succès
      } else {
        // Pour les mises à jour, juste effacer le message de succès après un délai
        setTimeout(() => {
          setSuccessMessage(null);
        }, 2000);
      }
      
      console.log('Produit enregistré avec succès');
    } catch (error: unknown) {
      console.error('Erreur lors de l\'enregistrement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement du produit';
      setErrorMessage(errorMessage);
      // Le formulaire reste ouvert en cas d'erreur
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    const success = await ProductService.delete(id);
    if (success) {
      // Mettre à jour localement la liste des produits
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== id)
      );
      
      // Fermer la sidebar si le produit supprimé était en cours d'édition
      if (editingProduct?.id === id) {
        setShowProductForm(false);
        setEditingProduct(null);
      }
    }
  };

  const handleQuantityChange = async (id: string, change: number) => {
    const success = await ProductService.updateQuantity(id, change);
    if (success) {
      // Mise à jour locale pour l'UI
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, quantity: p.quantity + change } : p
        )
      );
    } else {
      alert('Erreur lors de la mise à jour de la quantité.');
    }
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
    setScannedBarcode(null);
    setEditingProduct(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Statistiques
  const stats = {
    total: products.length,
    totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
    outOfStock: products.filter((p) => p.quantity === 0).length,
    lowStock: products.filter((p) => p.quantity > 0 && p.quantity < 5).length,
  };

  // Debug: Log pour diagnostiquer le problème des statistiques
  console.log('🔍 Debug statistiques:', {
    productsTotal: products.length,
    filteredProductsTotal: filteredProducts.length,
    searchQuery: searchQuery,
    totalItems: stats.totalItems
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-7 w-7 text-blue-600" />
                Inventory Manager
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestion intelligente de votre stock
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Version {APP_VERSION}
              </p>
            </div>
          </div>


          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium">Total produits</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600 font-medium">Total articles</p>
              <p className="text-2xl font-bold text-green-900">{stats.totalItems}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-xs text-orange-600 font-medium">Stock faible</p>
              <p className="text-2xl font-bold text-orange-900">{stats.lowStock}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs text-red-600 font-medium">Rupture</p>
              <p className="text-2xl font-bold text-red-900">{stats.outOfStock}</p>
            </div>
          </div>


          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtres et contrôles de vue */}
          <div className="flex items-center justify-between mb-4">
            {/* Filtres de statut */}
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
                className="whitespace-nowrap"
              >
                Tous ({products.length})
              </Button>
              <Button
                variant={activeFilter === 'in-stock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('in-stock')}
                className="whitespace-nowrap"
              >
                En stock ({products.filter(p => p.quantity >= 5).length})
              </Button>
              <Button
                variant={activeFilter === 'low-stock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('low-stock')}
                className="whitespace-nowrap"
              >
                Stock faible ({stats.lowStock})
              </Button>
              <Button
                variant={activeFilter === 'out-of-stock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('out-of-stock')}
                className="whitespace-nowrap"
              >
                Rupture ({stats.outOfStock})
              </Button>
            </div>

            {/* Contrôles de vue */}
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Actions flottantes (mobile-first) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-20">
        <Button
          size="lg"
          onClick={() => setShowScanner(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          <Camera className="h-6 w-6" />
        </Button>
        <Button
          size="lg"
          onClick={() => {
            setScannedBarcode(null);
            setEditingProduct(null);
            setShowProductForm(true);
          }}
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Liste des produits */}
      <div className="container mx-auto px-4 py-6 pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Chargement des produits...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'Aucun résultat' : 'Aucun produit'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Essayez une autre recherche'
                : 'Commencez par scanner ou ajouter un produit'}
            </p>
            {!searchQuery && (
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setShowScanner(true)}>
                  <Camera className="h-4 w-4 mr-2" />
                  Scanner
                </Button>
                <Button variant="outline" onClick={() => setShowProductForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                {searchQuery && ' trouvé' + (filteredProducts.length > 1 ? 's' : '')}
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  Effacer
                </Button>
              )}
            </div>

            {/* Affichage conditionnel selon le mode de vue */}
            {viewMode === 'list' ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {filteredProducts.map((product) => (
                  <ProductListItem
                    key={product.id}
                    product={product}
                    onSelect={handleSelectProduct}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleSelectProduct}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Scanner Modal */}
      <ClientOnly>
        {showScanner && (
          <BarcodeScanner
            onScanSuccess={handleScanSuccess}
            onClose={() => setShowScanner(false)}
          />
        )}
      </ClientOnly>

      {/* Product Inspector Sidebar */}
      <ClientOnly>
        {showProductForm && (
          <ProductInspector
            product={editingProduct}
            barcode={scannedBarcode || undefined}
            onSubmit={handleAddProduct}
            onDelete={handleDeleteProduct}
            onClose={handleCloseForm}
            isLoading={isSubmitting}
          />
        )}
      </ClientOnly>
    </main>
  );
}
