'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Package, Hash, Tag, ArrowUpFromLine, ArrowDownToLine, Edit3, ChevronUp, ChevronDown, ChevronsUpDown, Eye, EyeOff, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

interface ColumnVisibility {
  manufacturer_ref: boolean;
  category: boolean;
  quantity: boolean;
  selling_price_htva: boolean;
  purchase_price_htva: boolean;
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
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    manufacturer_ref: true,
    category: true,
    quantity: true,
    selling_price_htva: true,
    purchase_price_htva: false
  });

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

  const applyFilters = (newFilterConfig: FilterConfig) => {
    setFilterConfig(newFilterConfig);
  };

  const resetFilters = () => {
    setFilterConfig({
      categories: [],
      stockStatus: [],
      priceRange: { min: null, max: null }
    });
  };

  const toggleColumnVisibility = (column: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const sortProducts = (productsToSort: (Product & { categories?: { name: string } })[]) => {
    if (!sortConfig.field || !sortConfig.direction) {
      return productsToSort;
    }

    return [...productsToSort].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'manufacturer_ref':
          aValue = a.manufacturer_ref?.toLowerCase() || '';
          bValue = b.manufacturer_ref?.toLowerCase() || '';
          break;
        case 'category':
          aValue = a.categories?.name?.toLowerCase() || '';
          bValue = b.categories?.name?.toLowerCase() || '';
          break;
        case 'quantity':
          aValue = a.quantity || 0;
          bValue = b.quantity || 0;
          break;
        case 'selling_price_htva':
          aValue = a.selling_price_htva || 0;
          bValue = b.selling_price_htva || 0;
          break;
        case 'purchase_price_htva':
          aValue = a.purchase_price_htva || 0;
          bValue = b.purchase_price_htva || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filterProducts = (productsToFilter: (Product & { categories?: { name: string } })[]) => {
    let filtered = productsToFilter;

    if (filterConfig.categories.length > 0) {
      filtered = filtered.filter(product =>
        product.categories?.name && filterConfig.categories.includes(product.categories.name)
      );
    }

    if (filterConfig.stockStatus.length > 0) {
      filtered = filtered.filter(product => {
        const quantity = product.quantity || 0;
        return filterConfig.stockStatus.some(status => {
          switch (status) {
            case 'in-stock':
              return quantity >= 5;
            case 'low-stock':
              return quantity > 0 && quantity < 5;
            case 'out-of-stock':
              return quantity === 0;
            default:
              return false;
          }
        });
      });
    }

    if (filterConfig.priceRange.min !== null || filterConfig.priceRange.max !== null) {
      filtered = filtered.filter(product => {
        const price = product.selling_price_htva || 0;
        const min = filterConfig.priceRange.min || 0;
        const max = filterConfig.priceRange.max || Infinity;
        return price >= min && price <= max;
      });
    }

    return filtered;
  };

  const processedProducts = sortProducts(filterProducts(products));

  return (
    <>
      {/* Header avec recherche et filtres */}
      <div className="p-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Chercher..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={() => setShowFilterModal(true)}
            title="Filtres"
          >
            <Filter className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={() => setShowColumnModal(true)}
            title="Colonnes"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Header de colonnes - Desktop uniquement */}
      <div className="hidden md:block bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3 py-2 px-4 text-xs font-medium text-gray-600 uppercase tracking-wide">
          <div className="w-4"></div>
          <div className="w-12"></div>
          <button 
            className="flex-1 flex items-center gap-1 hover:text-gray-800 transition-colors"
            onClick={() => handleSort('name')}
          >
            <span>Produit</span>
            {getSortIcon('name')}
          </button>
          {columnVisibility.manufacturer_ref && (
            <button 
              className="w-24 flex items-center gap-1 hover:text-gray-800 transition-colors"
              onClick={() => handleSort('manufacturer_ref')}
            >
              <Hash className="h-3 w-3" />
              <span>Réf.</span>
              {getSortIcon('manufacturer_ref')}
            </button>
          )}
          {columnVisibility.category && (
            <button 
              className="w-32 flex items-center gap-1 hover:text-gray-800 transition-colors"
              onClick={() => handleSort('category')}
            >
              <Tag className="h-3 w-3" />
              <span>Catégorie</span>
              {getSortIcon('category')}
            </button>
          )}
          {columnVisibility.quantity && (
            <button 
              className="w-20 flex items-center justify-end gap-1 hover:text-gray-800 transition-colors"
              onClick={() => handleSort('quantity')}
            >
              <span>Stock</span>
              {getSortIcon('quantity')}
            </button>
          )}
          {columnVisibility.selling_price_htva && (
            <button 
              className="w-20 flex items-center justify-end gap-1 hover:text-gray-800 transition-colors"
              onClick={() => handleSort('selling_price_htva')}
            >
              <span>Prix Vente</span>
              {getSortIcon('selling_price_htva')}
            </button>
          )}
          {columnVisibility.purchase_price_htva && (
            <button 
              className="w-20 flex items-center justify-end gap-1 hover:text-gray-800 transition-colors"
              onClick={() => handleSort('purchase_price_htva')}
            >
              <span>Prix Achat</span>
              {getSortIcon('purchase_price_htva')}
            </button>
          )}
          <div className="w-8"></div>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="bg-white">
        {processedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Package className="h-8 w-8 mb-2 text-gray-300" />
            <p className="text-sm">Aucun produit trouvé</p>
          </div>
        ) : (
          <div>
            {processedProducts.map((product) => (
              <CompactProductListItem
                key={product.id}
                product={product}
                onSelect={onProductSelect}
                onStockEdit={onStockEdit}
                columnVisibility={columnVisibility}
              />
            ))}
            
            {/* Ligne de total */}
            <div className="hidden md:flex items-center gap-3 py-3 px-4 border-t-2 border-gray-300 bg-gray-50 font-semibold text-gray-900">
              <div className="w-4"></div>
              <div className="w-12"></div>
              <div className="flex-1">
                <span className="text-sm">Total ({processedProducts.length} produits)</span>
              </div>
              {columnVisibility.manufacturer_ref && <div className="w-24"></div>}
              {columnVisibility.category && <div className="w-32"></div>}
              {columnVisibility.quantity && (
                <div className="w-20 text-right">
                  <span className="text-sm">
                    {processedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0)} unités
                  </span>
                </div>
              )}
              {columnVisibility.selling_price_htva && (
                <div className="w-20 text-right">
                  <span className="text-sm">
                    {processedProducts.reduce((sum, p) => sum + (p.selling_price_htva || 0), 0).toFixed(2)}€
                  </span>
                </div>
              )}
              {columnVisibility.purchase_price_htva && (
                <div className="w-20 text-right">
                  <span className="text-sm">
                    {processedProducts.reduce((sum, p) => sum + (p.purchase_price_htva || 0), 0).toFixed(2)}€
                  </span>
                </div>
              )}
              <div className="w-8"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modale de filtres */}
      <FilterModalWrapper
        showFilterModal={showFilterModal}
        setShowFilterModal={setShowFilterModal}
        filterConfig={filterConfig}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        products={products}
      />
      
      {/* Modale de configuration des colonnes */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Configuration des colonnes</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowColumnModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manufacturer_ref"
                  checked={columnVisibility.manufacturer_ref}
                  onCheckedChange={() => toggleColumnVisibility('manufacturer_ref')}
                />
                <label htmlFor="manufacturer_ref" className="text-sm font-medium">
                  Référence fabricant
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="category"
                  checked={columnVisibility.category}
                  onCheckedChange={() => toggleColumnVisibility('category')}
                />
                <label htmlFor="category" className="text-sm font-medium">
                  Catégorie
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="quantity"
                  checked={columnVisibility.quantity}
                  onCheckedChange={() => toggleColumnVisibility('quantity')}
                />
                <label htmlFor="quantity" className="text-sm font-medium">
                  Stock
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selling_price_htva"
                  checked={columnVisibility.selling_price_htva}
                  onCheckedChange={() => toggleColumnVisibility('selling_price_htva')}
                />
                <label htmlFor="selling_price_htva" className="text-sm font-medium">
                  Prix de vente
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="purchase_price_htva"
                  checked={columnVisibility.purchase_price_htva}
                  onCheckedChange={() => toggleColumnVisibility('purchase_price_htva')}
                />
                <label htmlFor="purchase_price_htva" className="text-sm font-medium">
                  Prix d'achat
                </label>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowColumnModal(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Composant séparé pour la modale pour éviter les problèmes de conteneur
function FilterModalWrapper({ 
  showFilterModal, 
  setShowFilterModal, 
  filterConfig, 
  applyFilters, 
  resetFilters, 
  products 
}: {
  showFilterModal: boolean;
  setShowFilterModal: (show: boolean) => void;
  filterConfig: FilterConfig;
  applyFilters: (config: FilterConfig) => void;
  resetFilters: () => void;
  products: (Product & { categories?: { name: string } })[];
}) {
  if (!showFilterModal) return null;
  
  return (
    <FilterModal
      isOpen={showFilterModal}
      onClose={() => setShowFilterModal(false)}
      filterConfig={filterConfig}
      onApplyFilters={applyFilters}
      onResetFilters={resetFilters}
      products={products}
    />
  );
}