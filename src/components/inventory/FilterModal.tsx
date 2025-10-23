'use client';

import { useState } from 'react';
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

  const handleApply = () => {
    onApplyFilters(localConfig);
  };

  const handleReset = () => {
    setLocalConfig({
      categories: [],
      stockStatus: [],
      priceRange: { min: null, max: null }
    });
    onResetFilters();
  };

  const renderFilterContent = () => {
    switch (activeCategory) {
      case 'statut':
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="space-y-3">
              {stockStatusOptions
                .filter(option => 
                  option.label.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(option => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={option.id}
                      checked={localConfig.stockStatus.includes(option.id as StockStatus)}
                      onCheckedChange={() => handleStockStatusToggle(option.id as StockStatus)}
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={option.id}
                        className="text-sm font-medium text-gray-900 cursor-pointer"
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
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="space-y-3">
              {uniqueCategories
                .filter(category => 
                  category.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(category => (
                  <div key={category} className="flex items-center space-x-3">
                    <Checkbox
                      id={category}
                      checked={localConfig.categories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <label 
                      htmlFor={category}
                      className="text-sm font-medium text-gray-900 cursor-pointer"
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
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="space-y-3">
              {uniqueBrands
                .filter(brand => 
                  brand.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(brand => (
                  <div key={brand} className="flex items-center space-x-3">
                    <Checkbox
                      id={brand}
                      checked={localConfig.categories.includes(`brand:${brand}`)}
                      onCheckedChange={() => handleBrandToggle(brand)}
                    />
                    <label 
                      htmlFor={brand}
                      className="text-sm font-medium text-gray-900 cursor-pointer"
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
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Filtrer par gamme de prix
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix minimum (€)
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix maximum (€)
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
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>Filtre en cours de développement</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex h-[500px]">
          {/* Panel gauche - Catégories */}
          <div className="w-64 border-r bg-gray-50 p-4">
            <div className="space-y-2">
              {filterCategories.map(category => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id as FilterCategory)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      isActive 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser tout
              </Button>
            </div>
          </div>

          {/* Panel droit - Options de filtre */}
          <div className="flex-1 p-6">
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 capitalize">
                  {filterCategories.find(c => c.id === activeCategory)?.label}
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {renderFilterContent()}
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Effacer
                </Button>
                <Button
                  onClick={handleApply}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Filtrer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
