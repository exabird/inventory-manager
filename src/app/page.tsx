'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Camera, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/supabase';
import { ProductService } from '@/lib/services';
import ProductCard from '@/components/inventory/ProductCard';
import ProductForm from '@/components/inventory/ProductForm';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';

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

  // Filtrer les produits lors de la recherche
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.barcode.toLowerCase().includes(query) ||
          p.manufacturer?.toLowerCase().includes(query) ||
          p.internal_ref?.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

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

  const handleAddProduct = async (data: any) => {
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
        await ProductService.update(editingProduct.id, data);
        setSuccessMessage('Produit mis à jour avec succès !');
      } else {
        // Création
        console.log('Création d\'un nouveau produit');
        await ProductService.create({
          ...data,
          metadata: {},
        });
        setSuccessMessage('Produit ajouté avec succès !');
      }
      
      // Recharger la liste
      await loadProducts();
      
      // Fermer le formulaire seulement en cas de succès
      setTimeout(() => {
        setShowProductForm(false);
        setScannedBarcode(null);
        setEditingProduct(null);
        setSuccessMessage(null);
      }, 1500); // Délai pour voir le message de succès
      
      console.log('Produit enregistré avec succès');
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement:', error);
      setErrorMessage(error.message || 'Erreur lors de l\'enregistrement du produit');
      // Le formulaire reste ouvert en cas d'erreur
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    const success = await ProductService.delete(id);
    if (success) {
      await loadProducts();
    } else {
      alert('Erreur lors de la suppression du produit.');
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Formulaire de produit */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
            </DialogTitle>
          </DialogHeader>
          
          {/* Messages de notification */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 font-medium">
                    {errorMessage}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800 font-medium">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <ProductForm
            product={editingProduct}
            barcode={scannedBarcode || undefined}
            onSubmit={handleAddProduct}
            onCancel={handleCloseForm}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
