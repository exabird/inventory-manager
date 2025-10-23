'use client';

import { useState } from 'react';
import { Search, Filter, Package, Hash, Tag, ArrowUpFromLine, ArrowDownToLine, Edit3, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CompactProductListItem from '@/components/inventory/CompactProductListItem';
import FilterModal from '@/components/inventory/FilterModal';
import { Product } from '@/lib/supabase';

type SortField = 'name' | 'manufacturer_ref' | 'category' | 'quantity' | 'selling_price_htva' | 'purchase_price_htva';
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

interface FilterConfig {
  categories: string[];
  stockStatus: ('in-stock' | 'low-stock' | 'out-of-stock')[];
  priceRange: { min: number | null; max: number | null };
}

interface CompactProductListProps {
  products: (Product & { categories?: { name: string } })[];
  onProductSelect: (product: Product) => void;
  onStockEdit: (product: Product) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function CompactProductList({
  products,
  onProductSelect,
  onStockEdit,
  searchQuery,
  onSearchChange
}: CompactProductListProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    categories: [],
    stockStatus: [],
    priceRange: { min: null, max: null }
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Fonction de tri
  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc';
    
    if (sortConfig.field === field) {
      if (sortConfig.direction === 'asc') {
        newDirection = 'desc';
      } else if (sortConfig.direction === 'desc') {
        newDirection = null;
      }
    }
    
    setSortConfig({ field: newDirection ? field : null, direction: newDirection });
  };

  // Fonction pour obtenir l'icône de tri
  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronsUpDown className="h-3 w-3 text-gray-400" />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <ChevronUp className="h-3 w-3 text-gray-600" />;
    } else if (sortConfig.direction === 'desc') {
      return <ChevronDown className="h-3 w-3 text-gray-600" />;
    }
    
    return <ChevronsUpDown className="h-3 w-3 text-gray-400" />;
  };

  // Fonction pour appliquer les filtres
  const applyFilters = (newFilterConfig: FilterConfig) => {
    setFilterConfig(newFilterConfig);
    setShowFilterModal(false);
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setFilterConfig({
      categories: [],
      stockStatus: [],
      priceRange: { min: null, max: null }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header avec recherche et filtre */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Chercher un produit..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          
          {/* Bouton filtre */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3"
            onClick={() => setShowFilterModal(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtre
          </Button>
        </div>
      </div>

      {/* Header de colonnes */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3 py-2 px-4 text-xs font-medium text-gray-600 uppercase tracking-wide">
          {/* Checkbox */}
          <div className="w-4"></div>
          
          {/* Image */}
          <div className="w-12"></div>
          
          {/* Nom - Triable */}
          <button 
            className="flex-1 flex items-center gap-1 hover:text-gray-800 transition-colors"
            onClick={() => handleSort('name')}
          >
            <span>Produit</span>
            {getSortIcon('name')}
          </button>
          
          {/* Référence fabricant - Triable */}
          <button 
            className="w-24 flex items-center gap-1 hover:text-gray-800 transition-colors"
            onClick={() => handleSort('manufacturer_ref')}
          >
            <Hash className="h-3 w-3" />
            <span>Réf.</span>
            {getSortIcon('manufacturer_ref')}
          </button>
          
          {/* Catégorie - Triable */}
          <button 
            className="w-32 flex items-center gap-1 hover:text-gray-800 transition-colors"
            onClick={() => handleSort('category')}
          >
            <Tag className="h-3 w-3" />
            <span>Catégorie</span>
            {getSortIcon('category')}
          </button>
          
          {/* Statut */}
          <div className="w-20">Statut</div>
          
          {/* Stock - Triable */}
          <button 
            className="w-16 flex items-center justify-center gap-1 hover:text-gray-800 transition-colors"
            onClick={() => handleSort('quantity')}
          >
            <Package className="h-3 w-3" />
            <span>Stock</span>
            {getSortIcon('quantity')}
          </button>
          
          {/* Prix vente - Triable */}
          <button 
            className="w-20 flex items-center justify-center gap-1 hover:text-gray-800 transition-colors"
            onClick={() => handleSort('selling_price_htva')}
          >
            <ArrowUpFromLine className="h-3 w-3" />
            <span>Vente</span>
            {getSortIcon('selling_price_htva')}
          </button>
          
          {/* Prix achat - Triable */}
          <button 
            className="w-20 flex items-center justify-center gap-1 hover:text-gray-800 transition-colors"
            onClick={() => handleSort('purchase_price_htva')}
          >
            <ArrowDownToLine className="h-3 w-3" />
            <span>Achat</span>
            {getSortIcon('purchase_price_htva')}
          </button>
          
          {/* Actions */}
          <div className="w-8"></div>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="max-h-[600px] overflow-y-auto">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Package className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-sm">Aucun produit trouvé</p>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par ajouter votre premier produit'}
            </p>
          </div>
        ) : (
          products.map((product) => (
            <CompactProductListItem
              key={product.id}
              product={product}
              onSelect={onProductSelect}
              onStockEdit={onStockEdit}
            />
          ))
        )}
      </div>

      {/* Footer avec statistiques */}
      {products.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{products.length} produit{products.length > 1 ? 's' : ''}</span>
            <div className="flex items-center gap-4">
              <span>Total stock: {products.reduce((sum, p) => sum + p.quantity, 0)}</span>
              <span>En stock: {products.filter(p => p.quantity > 0).length}</span>
              <span>Rupture: {products.filter(p => p.quantity === 0).length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modale de filtres */}
      {showFilterModal && (
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filterConfig={filterConfig}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          products={products}
        />
      )}
    </div>
  );
}
