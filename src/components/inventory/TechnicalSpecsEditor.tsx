'use client';

/**
 * 🛠️ Éditeur de spécifications techniques
 * 
 * Affiche et édite les spécifications techniques d'un produit avec :
 * - Détection automatique du type de champ (text, number, boolean, tags, select)
 * - Groupement par catégorie
 * - Affichage uniquement des champs remplis
 * - Ajout de nouvelles spécifications via dropdown
 * - Mode JSON pour édition avancée
 * - Indicateurs IA pour les champs remplis automatiquement
 */

import { useState } from 'react';
import { TechnicalSpecifications } from '@/lib/supabase';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AIFieldButton from '@/components/ui/AIFieldButton';
import TechnicalSpecInput from './TechnicalSpecInput';
import { 
  Trash2,
  Plus,
  Code,
  ChevronDown,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TECHNICAL_SPEC_FIELDS,
  getAllCategories,
  getFieldsByCategory,
  getCategoryIcon,
  type SpecCategory
} from '@/lib/technicalSpecifications';

interface TechnicalSpecsEditorProps {
  value: TechnicalSpecifications | null;
  onChange: (specs: TechnicalSpecifications | null) => void;
  isAIGenerated?: boolean;
  productName?: string;
  productBarcode?: string;
}

export default function TechnicalSpecsEditor({
  value,
  onChange,
  isAIGenerated = false,
  productName,
  productBarcode
}: TechnicalSpecsEditorProps) {
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonValue, setJsonValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const specs = value || {};

  // Champs actuellement remplis (avec valeur définie)
  const filledFields = TECHNICAL_SPEC_FIELDS.filter(field => {
    const val = specs[field.key];
    return val !== undefined && val !== null && val !== '';
  });

  // Champs disponibles (non remplis) groupés par catégorie, filtrés par recherche
  const availableFieldsByCategory = getAllCategories().reduce((acc, category) => {
    const fields = getFieldsByCategory(category).filter(field => {
      const val = specs[field.key];
      const isEmpty = val === undefined || val === null || val === '';
      
      // Filtrer par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesLabel = field.label.toLowerCase().includes(query);
        const matchesCategory = category.toLowerCase().includes(query);
        return isEmpty && (matchesLabel || matchesCategory);
      }
      
      return isEmpty;
    });
    if (fields.length > 0) {
      acc[category] = fields;
    }
    return acc;
  }, {} as Record<SpecCategory, typeof TECHNICAL_SPEC_FIELDS>);

  // Grouper les champs remplis par catégorie
  const filledFieldsByCategory = getAllCategories().reduce((acc, category) => {
    const fields = filledFields.filter(f => f.category === category);
    if (fields.length > 0) {
      acc[category] = fields;
    }
    return acc;
  }, {} as Record<SpecCategory, typeof TECHNICAL_SPEC_FIELDS>);

  /**
   * Mettre à jour une spécification
   */
  const handleFieldChange = (key: string, val: any) => {
    console.log('📝 [TechnicalSpecsEditor] Modification:', key, val);
    const newSpecs = { ...specs };
    
    if (val === undefined || val === null || val === '') {
      // Supprimer le champ si vide
      delete newSpecs[key];
    } else {
      newSpecs[key] = val;
    }

    onChange(Object.keys(newSpecs).length > 0 ? newSpecs : null);
  };

  /**
   * Supprimer une spécification
   */
  const handleRemoveField = (key: string) => {
    console.log('🗑️ [TechnicalSpecsEditor] Suppression:', key);
    const newSpecs = { ...specs };
    delete newSpecs[key];
    onChange(Object.keys(newSpecs).length > 0 ? newSpecs : null);
  };

  /**
   * Ajouter une spécification prédéfinie
   */
  const handleAddField = (key: string) => {
    console.log('➕ [TechnicalSpecsEditor] Ajout:', key);
    const field = TECHNICAL_SPEC_FIELDS.find(f => f.key === key);
    if (!field) return;

    const newSpecs = { ...specs };
    
    // Valeur par défaut selon le type
    switch (field.type) {
      case 'boolean':
        newSpecs[key] = 'false';
        break;
      case 'number':
        newSpecs[key] = field.min || 0;
        break;
      case 'tags':
        newSpecs[key] = '';
        break;
      default:
        newSpecs[key] = '';
    }

    onChange(newSpecs);
    
    // Réinitialiser la recherche après ajout
    setSearchQuery('');
  };

  /**
   * Basculer vers l'éditeur JSON
   */
  const toggleJsonEditor = () => {
    if (!showJsonEditor) {
      // Passer en mode JSON : sérialiser les specs
      setJsonValue(JSON.stringify(specs, null, 2));
    } else {
      // Revenir en mode visuel : parser le JSON
      try {
        const parsed = JSON.parse(jsonValue);
        onChange(Object.keys(parsed).length > 0 ? parsed : null);
      } catch (error) {
        console.error('❌ [TechnicalSpecsEditor] JSON invalide:', error);
        alert('JSON invalide. Vérifiez la syntaxe.');
        return;
      }
    }
    setShowJsonEditor(!showJsonEditor);
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📝 MODE JSON
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (showJsonEditor) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Mode JSON avancé</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleJsonEditor}
          >
            Revenir au mode visuel
          </Button>
        </div>
        
        <textarea
          value={jsonValue}
          onChange={(e) => setJsonValue(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder='{\n  "processor": "Intel Core i5",\n  "ram_gb": 8\n}'
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={toggleJsonEditor}
          >
            Appliquer les modifications
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowJsonEditor(false);
              setJsonValue('');
            }}
          >
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎨 MODE VISUEL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-gray-700">
            Spécifications techniques
          </h3>
          {filledFields.length > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {filledFields.length} définie{filledFields.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Bouton Ajouter une spécification - Style amélioré */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="gap-1.5 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
                <ChevronDown className="h-3 w-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 max-h-96 overflow-hidden flex flex-col">
              {/* Champ de recherche */}
              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une spécification..."
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>
              
              {/* Liste des spécifications */}
              <div className="overflow-y-auto">
                {Object.entries(availableFieldsByCategory).map(([category, fields]) => {
                const CategoryIcon = getCategoryIcon(category as SpecCategory);
                return (
                  <div key={category}>
                    <DropdownMenuLabel className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      <CategoryIcon className="h-3.5 w-3.5" />
                      {category}
                    </DropdownMenuLabel>
                    {fields.map((field) => {
                      const FieldIcon = field.icon;
                      return (
                        <DropdownMenuItem
                          key={field.key}
                          onClick={() => handleAddField(field.key)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <FieldIcon className="h-3.5 w-3.5 text-gray-400" />
                          <span className="flex-1">{field.label}</span>
                          {field.unit && (
                            <span className="text-xs text-gray-400">({field.unit})</span>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                  </div>
                );
              })}
              
                {Object.keys(availableFieldsByCategory).length === 0 && (
                  <div className="px-3 py-8 text-center text-sm text-gray-500">
                    {searchQuery 
                      ? `Aucun résultat pour "${searchQuery}"`
                      : '✅ Toutes les spécifications disponibles sont remplies'
                    }
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bouton Mode JSON - Plus discret */}
          <button
            type="button"
            onClick={toggleJsonEditor}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Mode JSON"
          >
            <Code className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Message si aucune spécification */}
      {filledFields.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500 mb-3">
            Aucune spécification technique définie
          </p>
          <p className="text-xs text-gray-400">
            Cliquez sur "Ajouter" pour commencer ou utilisez "Remplir avec l'IA"
          </p>
        </div>
      )}

      {/* Spécifications groupées par catégorie */}
      {Object.entries(filledFieldsByCategory).map(([category, fields]) => {
        const CategoryIcon = getCategoryIcon(category as SpecCategory);
        
        return (
          <div key={category} className="space-y-3">
            {/* En-tête de catégorie */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <CategoryIcon className="h-4 w-4 text-gray-600" />
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {category}
              </h4>
              <span className="text-xs text-gray-400">
                {fields.length}
              </span>
            </div>

            {/* Champs de la catégorie - Grid avec hauteurs uniformes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => {
                const FieldIcon = field.icon;
                const fieldValue = specs[field.key];
                const isAIField = isAIGenerated && fieldValue !== undefined;

                return (
                  <div key={field.key} className="space-y-2 relative">
                    {/* Label avec icône et bouton IA juste après */}
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 group/aifield">
                      <FieldIcon className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{field.label}</span>
                      {field.unit && (
                        <span className="text-xs text-gray-400 flex-shrink-0">({field.unit})</span>
                      )}
                      
                      {/* Bouton IA juste après le label (visible au hover ou si déjà rempli par IA) */}
                      <span className={isAIField ? 'opacity-100' : 'opacity-0 group-hover/aifield:opacity-100 transition-opacity'}>
                        <AIFieldButton
                          fieldKey={field.key}
                          fieldLabel={field.label}
                          productName={productName}
                          productBarcode={productBarcode}
                          isAIGenerated={isAIField}
                          onFillComplete={(val) => handleFieldChange(field.key, val)}
                        />
                      </span>
                    </Label>

                    {/* Input adapté au type */}
                    <TechnicalSpecInput
                      field={field}
                      value={fieldValue}
                      onChange={(val) => handleFieldChange(field.key, val)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
