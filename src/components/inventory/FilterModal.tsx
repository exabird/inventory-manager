'use client';

import { useState, useEffect } from 'react';
import { X, Search, Package, Tag, DollarSign, Calendar, Building2, RotateCcw, Settings, Eye, EyeOff, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/supabase';

type FilterCategory = 'statut' | 'categorie' | 'prix' | 'marque' | 'date' | 'stock' | 'colonnes';
type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

interface FilterConfig {
  categories: string[];
  stockStatus: StockStatus[];
  priceRange: { min: number | null; max: number | null };
}

interface ColumnVisibility {
  manufacturer_ref: boolean;
  category: boolean;
  quantity: boolean;
  selling_price_htva: boolean;
  purchase_price_htva: boolean;
  brand: boolean;
  warranty_period: boolean;
  min_stock_quantity: boolean;
  [key: string]: boolean; // Pour les métadonnées dynamiques
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterConfig: FilterConfig;
  onApplyFilters: (config: FilterConfig) => void;
  onResetFilters: () => void;
  products: (Product & { categories?: { name: string } })[];
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
}

const filterCategories = [
  { id: 'statut', label: 'Statut', icon: Package },
  { id: 'categorie', label: 'Catégorie', icon: Tag },
  { id: 'prix', label: 'Prix', icon: DollarSign },
  { id: 'marque', label: 'Marque', icon: Building2 },
  { id: 'date', label: 'Date', icon: Calendar },
  { id: 'stock', label: 'Stock', icon: Package },
  { id: 'colonnes', label: 'Colonnes', icon: Settings },
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
  products,
  columnVisibility,
  onColumnVisibilityChange
}: FilterModalProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('statut');
  const [localConfig, setLocalConfig] = useState<FilterConfig>(filterConfig);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceTimeout, setPriceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [customFieldName, setCustomFieldName] = useState('');

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

  const handleColumnToggle = (columnKey: string) => {
    onColumnVisibilityChange({
      ...columnVisibility,
      [columnKey]: !columnVisibility[columnKey]
    });
  };

  const handleAddCustomColumn = (fieldName: string) => {
    if (fieldName && !columnVisibility[fieldName]) {
      onColumnVisibilityChange({
        ...columnVisibility,
        [fieldName]: true
      });
    }
  };

  // Extraire toutes les métadonnées disponibles des produits
  const getAllMetadataFields = () => {
    try {
      const allFields = new Set<string>();
      const metadataFields = new Set<string>();
      
      products.forEach(product => {
        try {
          // Champs de base (exclure les champs déjà gérés)
          const excludedFields = ['id', 'created_at', 'updated_at', 'manufacturer_ref', 'category', 'quantity', 'selling_price_htva', 'purchase_price_htva'];
          Object.keys(product).forEach(key => {
            if (!excludedFields.includes(key)) {
              allFields.add(key);
            }
          });
          
          // Métadonnées dans l'objet metadata
          if (product.metadata && typeof product.metadata === 'object') {
            Object.keys(product.metadata).forEach(key => {
              metadataFields.add(`metadata.${key}`);
            });
          }
        } catch (error) {
          console.warn('⚠️ Erreur lors du traitement d\'un produit:', error);
        }
      });
      
      // Organiser les champs par catégorie
      const baseFields = Array.from(allFields).sort();
      const metaFields = Array.from(metadataFields).sort();
      
      return {
        base: baseFields,
        metadata: metaFields,
        all: [...baseFields, ...metaFields].sort()
      };
    } catch (error) {
      console.warn('⚠️ Erreur lors de l\'extraction des métadonnées:', error);
      return {
        base: [],
        metadata: [],
        all: []
      };
    }
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

      case 'colonnes':
        const fieldData = getAllMetadataFields();
        
        return (
          <div className="space-y-4">
            <div className="text-xs text-gray-600">
              Configurer l'affichage des colonnes
            </div>
            
            {/* Colonnes principales - Shadcn sobre */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                Colonnes principales
              </h4>
              <div className="space-y-1.5">
                {[
                  { key: 'manufacturer_ref', label: 'Référence fabricant', icon: Hash },
                  { key: 'category', label: 'Catégorie', icon: Tag },
                  { key: 'brand', label: 'Marque', icon: Building2 },
                  { key: 'quantity', label: 'Stock', icon: Package },
                  { key: 'selling_price_htva', label: 'Prix de vente', icon: DollarSign },
                  { key: 'purchase_price_htva', label: 'Prix d\'achat', icon: DollarSign }
                ].map(column => {
                  const isChecked = columnVisibility[column.key] || false;
                  return (
                    <div 
                      key={column.key} 
                      className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                        isChecked 
                          ? 'bg-muted border-border' 
                          : 'border-transparent hover:bg-muted/50'
                      }`}
                      onClick={() => handleColumnToggle(column.key)}
                    >
                      <Checkbox
                        id={column.key}
                        checked={isChecked}
                        onCheckedChange={() => handleColumnToggle(column.key)}
                      />
                      <column.icon className="h-4 w-4 text-muted-foreground" />
                      <label 
                        htmlFor={column.key}
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {column.label}
                      </label>
                      {isChecked && (
                        <Eye className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Champs de base supplémentaires */}
            {fieldData.base.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  Champs de base
                </h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    placeholder="Rechercher un champ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {fieldData.base
                    .filter(field => 
                      field.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(field => (
                      <div key={field} className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50">
                        <Checkbox
                          id={field}
                          checked={columnVisibility[field] || false}
                          onCheckedChange={() => handleColumnToggle(field)}
                          className="h-4 w-4"
                        />
                        <label 
                          htmlFor={field}
                          className="text-xs font-medium text-gray-900 cursor-pointer flex-1"
                        >
                          {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Métadonnées personnalisées - Shadcn sobre */}
            {fieldData.metadata.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Métadonnées personnalisées
                  <Badge variant="secondary" className="ml-auto">
                    {fieldData.metadata.length}
                  </Badge>
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {fieldData.metadata
                    .filter(field => 
                      field.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(field => {
                      const isChecked = columnVisibility[field] || false;
                      return (
                        <div 
                          key={field} 
                          className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                            isChecked 
                              ? 'bg-muted border-border' 
                              : 'border-transparent hover:bg-muted/50'
                          }`}
                          onClick={() => handleColumnToggle(field)}
                        >
                          <Checkbox
                            id={field}
                            checked={isChecked}
                            onCheckedChange={() => handleColumnToggle(field)}
                          />
                          <label 
                            htmlFor={field}
                            className="text-sm font-medium cursor-pointer flex-1"
                          >
                            {field.replace('metadata.', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                          {isChecked && (
                            <Eye className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Ajouter une colonne personnalisée - Shadcn sobre */}
            <div className="space-y-3 border-t pt-4 mt-4">
              <h4 className="text-xs font-semibold flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                Créer une colonne personnalisée
              </h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: couleur, taille..."
                  value={customFieldName}
                  onChange={(e) => setCustomFieldName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    handleAddCustomColumn(customFieldName);
                    setCustomFieldName('');
                  }}
                  disabled={!customFieldName}
                >
                  Ajouter
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Les colonnes personnalisées seront ajoutées comme métadonnées
              </p>
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
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4 animate-in fade-in duration-200">
      {/* Overlay Shadcn */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-card rounded-lg shadow-lg w-[28rem] max-h-[85vh] flex flex-col border animate-in slide-in-from-right duration-200">
        {/* Header Shadcn sobre */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Filtres & Colonnes
            </h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Categories - Shadcn */}
          <div className="w-32 border-r bg-muted/40 p-2 space-y-1 overflow-y-auto">
            {filterCategories.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveCategory(cat.id as FilterCategory)}
                >
                  <cat.icon className="h-4 w-4 mr-2" />
                  {cat.label}
                </Button>
              );
            })}
          </div>

          {/* Right Panel - Filter Options - Shadcn */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-3 pb-2 border-b">
              <h3 className="text-sm font-semibold capitalize">
                {filterCategories.find(c => c.id === activeCategory)?.label}
              </h3>
            </div>
            {renderFilterContent()}
          </div>
        </div>

        {/* Footer - Shadcn */}
        <div className="flex items-center justify-between p-4 border-t gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
          <Button 
            size="sm" 
            onClick={onClose}
          >
            Appliquer
          </Button>
        </div>
      </div>
    </div>
  );
}
