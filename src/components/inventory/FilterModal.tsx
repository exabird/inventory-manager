'use client';

import { useState, useEffect } from 'react';
import { X, Search, Package, Tag, DollarSign, Calendar, Building2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from '@/lib/supabase';

type FilterCategory = 'statut' | 'categorie' | 'prix' | 'marque' | 'date' | 'stock';
type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

interface FilterConfig {
  categories: string[];
  stockStatus: StockStatus[];
  priceRange: { min: number | null; max: number | null };
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterConfig: FilterConfig;
  onApplyFilters: (config: FilterConfig) => void;
  onResetFilters: () => void;
  products: (Product & { categories?: { name: string } })[];
}

const filterCategories = [
  { id: 'statut', label: 'Statut', icon: Package },
  { id: 'categorie', label: 'Catégorie', icon: Tag },
  { id: 'prix', label: 'Prix', icon: DollarSign },
  { id: 'marque', label: 'Marque', icon: Building2 },
  { id: 'date', label: 'Date', icon: Calendar },
  { id: 'stock', label: 'Stock', icon: Package },
];

const stockStatusOptions = [
  { id: 'in-stock', label: 'En stock', description: 'Quantité ≥ 5' },
  { id: 'low-stock', label: 'Stock faible', description: 'Quantité 1-4' },
  { id: 'out-of-stock', label: 'Rupture', description: 'Quantité = 0' },
];

export default function FilterModal({
  isOpen,
  onClose,
  filterConfig,
  onApplyFilters,
  onResetFilters,
  products
}: FilterModalProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('statut');
  const [localConfig, setLocalConfig] = useState<FilterConfig>(filterConfig);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceTimeout, setPriceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Appliquer les filtres en temps réel avec délai pour les prix
  useEffect(() => {
    if (priceTimeout) {
      clearTimeout(priceTimeout);
    }
    
    const timeout = setTimeout(() => {
      onApplyFilters(localConfig);
    }, 300); // Délai de 300ms pour éviter trop d'appels lors de la saisie
    
    setPriceTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [localConfig, onApplyFilters]);

  if (!isOpen) return null;

  // Extraire les catégories uniques des produits
  const uniqueCategories = Array.from(
    new Set(products.map(p => p.categories?.name).filter(Boolean))
  ) as string[];

  // Extraire les marques uniques des produits
  const uniqueBrands = Array.from(
    new Set(products.map(p => p.brand).filter(Boolean))
  ) as string[];

  const handleCategoryToggle = (categoryId: string) => {
    setLocalConfig(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleStockStatusToggle = (status: StockStatus) => {
    setLocalConfig(prev => ({
      ...prev,
      stockStatus: prev.stockStatus.includes(status)
        ? prev.stockStatus.filter(s => s !== status)
        : [...prev.stockStatus, status]
    }));
  };

  const handleBrandToggle = (brand: string) => {
    // Pour les marques, on pourrait utiliser un champ séparé ou les ajouter aux catégories
    // Pour l'instant, on les traite comme des catégories spéciales
    const brandCategory = `brand:${brand}`;
    setLocalConfig(prev => ({
      ...prev,
      categories: prev.categories.includes(brandCategory)
        ? prev.categories.filter(c => c !== brandCategory)
        : [...prev.categories, brandCategory]
    }));
  };

  const handleReset = () => {
    const resetConfig = {
      categories: [],
      stockStatus: [],
      priceRange: { min: null, max: null }
    };
    setLocalConfig(resetConfig);
    onResetFilters();
  };

  const renderFilterContent = () => {
    switch (activeCategory) {
      case 'statut':
        return (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            
            <div className="space-y-2">
              {stockStatusOptions
                .filter(option => 
                  option.label.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(option => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={localConfig.stockStatus.includes(option.id as StockStatus)}
                      onCheckedChange={() => handleStockStatusToggle(option.id as StockStatus)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={option.id}
                        className="text-xs font-medium text-gray-900 cursor-pointer"
                      >
                        {option.label}
                      </label>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );

      case 'categorie':
        return (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uniqueCategories
                .filter(category => 
                  category.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={localConfig.categories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                      className="h-4 w-4"
                    />
                    <label 
                      htmlFor={category}
                      className="text-xs font-medium text-gray-900 cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
            </div>
          </div>
        );

      case 'marque':
        return (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uniqueBrands
                .filter(brand => 
                  brand.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(brand => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={brand}
                      checked={localConfig.categories.includes(`brand:${brand}`)}
                      onCheckedChange={() => handleBrandToggle(brand)}
                      className="h-4 w-4"
                    />
                    <label 
                      htmlFor={brand}
                      className="text-xs font-medium text-gray-900 cursor-pointer"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
            </div>
          </div>
        );

      case 'prix':
        return (
          <div className="space-y-3">
            <div className="text-xs text-gray-600">
              Filtrer par gamme de prix
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Min (€)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localConfig.priceRange.min || ''}
                  onChange={(e) => setLocalConfig(prev => ({
                    ...prev,
                    priceRange: {
                      ...prev.priceRange,
                      min: e.target.value ? parseFloat(e.target.value) : null
                    }
                  }))}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Max (€)
                </label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={localConfig.priceRange.max || ''}
                  onChange={(e) => setLocalConfig(prev => ({
                    ...prev,
                    priceRange: {
                      ...prev.priceRange,
                      max: e.target.value ? parseFloat(e.target.value) : null
                    }
                  }))}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-gray-500">
            <p className="text-xs">Filtre en cours de développement</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-4">
      <div className="relative bg-white rounded-lg shadow-lg w-96 max-h-[80vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-lg font-semibold">Filtres</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Categories */}
          <div className="w-1/3 border-r bg-gray-50 p-2 space-y-1 overflow-y-auto">
            {filterCategories.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'secondary' : 'ghost'}
                className="w-full justify-start h-8 text-xs"
                onClick={() => setActiveCategory(cat.id as FilterCategory)}
              >
                <cat.icon className="h-3 w-3 mr-2" />
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Right Panel - Filter Options */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-900 capitalize">
                {filterCategories.find(c => c.id === activeCategory)?.label}
              </h3>
            </div>
            {renderFilterContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-3 border-t">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            Effacer tous les filtres
          </Button>
        </div>
      </div>
    </div>
  );
}
