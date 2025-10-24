'use client';

/**
 * 🎨 Composants d'input pour les spécifications techniques
 * Adapte automatiquement le type d'input selon le SpecField
 */

import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SpecField } from '@/lib/technicalSpecifications';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔢 INPUT NUMÉRIQUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface NumberInputProps {
  field: SpecField;
  value?: number;
  onChange: (value: number | undefined) => void;
}

export function NumberInput({ field, value, onChange }: NumberInputProps) {
  return (
    <div className="relative h-10">
      <Input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value === '' ? undefined : Number(e.target.value);
          onChange(val);
        }}
        placeholder={field.placeholder || `Entrez ${field.label.toLowerCase()}`}
        min={field.min}
        max={field.max}
        className="h-10 pr-12"
      />
      {field.unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none font-medium">
          {field.unit}
        </span>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 INPUT TEXTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface TextInputProps {
  field: SpecField;
  value?: string;
  onChange: (value: string | undefined) => void;
}

export function TextInput({ field, value, onChange }: TextInputProps) {
  return (
    <Input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      placeholder={field.placeholder || `Entrez ${field.label.toLowerCase()}`}
      className="h-10"
    />
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔘 TOGGLE BOOLÉEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface BooleanToggleProps {
  field: SpecField;
  value?: string | boolean;
  onChange: (value: string | undefined) => void;
}

export function BooleanToggle({ field, value, onChange }: BooleanToggleProps) {
  // Normaliser la valeur en boolean
  const isChecked = value === 'true' || value === true;

  return (
    <button
      type="button"
      onClick={() => onChange(isChecked ? 'false' : 'true')}
      className={cn(
        'h-10 px-4 flex items-center justify-center gap-2 rounded-md border-2 transition-all duration-200 font-medium text-sm',
        isChecked
          ? 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100'
          : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
      )}
    >
      <span className={cn(
        'text-base transition-transform',
        isChecked && 'scale-110'
      )}>
        {isChecked ? '✓' : '○'}
      </span>
      <span>{isChecked ? 'Activé' : 'Désactivé'}</span>
    </button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 SELECT DROPDOWN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SelectDropdownProps {
  field: SpecField;
  value?: string;
  onChange: (value: string | undefined) => void;
}

export function SelectDropdown({ field, value, onChange }: SelectDropdownProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!field.options || field.options.length === 0) {
    return <TextInput field={field} value={value} onChange={onChange} />;
  }

  // Si la valeur actuelle n'est pas dans les options, activer le mode personnalisé
  const valueInOptions = value && field.options.includes(value);
  const hasCustomValue = value && !valueInOptions;

  if (isCustomMode || hasCustomValue) {
    // Mode personnalisé : afficher input texte
    return (
      <div className="relative">
        <Input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="h-10 pr-8"
          placeholder={field.placeholder || `Valeur personnalisée`}
          autoFocus
        />
        <button
          type="button"
          onClick={() => {
            setIsCustomMode(false);
            onChange(undefined);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Choisir dans la liste"
        >
          <span className="text-sm">↻</span>
        </button>
      </div>
    );
  }

  return (
    <Select 
      value={value || ''} 
      onValueChange={(val) => {
        if (val === '__custom__') {
          setIsCustomMode(true);
          onChange(undefined);
        } else {
          onChange(val || undefined);
        }
      }}
    >
      <SelectTrigger className="h-10">
        <SelectValue placeholder={`Sélectionner ${field.label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {field.options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
        <SelectItem value="__custom__" className="text-blue-600 font-medium">
          ✏️ Valeur personnalisée...
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏷️ TAGS INPUT (pour listes de valeurs)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface TagsInputProps {
  field: SpecField;
  value?: string | string[];
  onChange: (value: string | undefined) => void;
}

export function TagsInput({ field, value, onChange }: TagsInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Convertir la valeur en tableau de tags
  const tags: string[] = (() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
  })();

  // Ajouter un tag
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) return;

    const newTags = [...tags, trimmed];
    onChange(newTags.join(','));
    setInputValue('');
  };

  // Supprimer un tag
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    onChange(newTags.length > 0 ? newTags.join(',') : undefined);
  };

  // Supprimer tout
  const clearAll = () => {
    onChange(undefined);
  };

  // Gérer la touche Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Supprimer le dernier tag si backspace sur input vide
      removeTag(tags[tags.length - 1]);
    }
  };

  // Suggestions filtrées
  const suggestions = field.defaultTags?.filter(
    tag => !tags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
  ) || [];

  return (
    <div className="relative">
      {/* Container principal - aspect d'un input */}
      <div
        className={cn(
          'relative border border-gray-200 rounded-md bg-white transition-all duration-200',
          'hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20',
          'h-10 overflow-hidden group'
        )}
        onMouseEnter={() => {
          setIsHovered(true);
          if (tags.length > 2) setIsExpanded(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsExpanded(false);
        }}
      >
        <div className="flex flex-wrap gap-1.5 p-2 min-h-10 items-center">
          {/* Tags existants */}
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="pl-2 pr-1 py-0.5 text-xs font-medium shrink-0"
            >
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}

          {/* Input pour ajouter des tags */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={tags.length > 0 ? 'Ajouter...' : `Entrez ${field.label.toLowerCase()}`}
            className="flex-1 min-w-24 outline-none bg-transparent text-sm placeholder:text-gray-400"
          />
        </div>

        {/* Indicateur de scroll si beaucoup de tags */}
        {!isExpanded && tags.length > 3 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            +{tags.length - 3}
          </div>
        )}

        {/* Bouton supprimer tout (coin supérieur droit au hover) */}
        {tags.length > 0 && isHovered && (
          <button
            type="button"
            onClick={clearAll}
            className="absolute top-1 right-1 p-1 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition-colors shadow-sm border border-gray-200"
            title="Supprimer tout"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Expansion vers le haut avec animation */}
      {isExpanded && tags.length > 3 && (
        <div
          className="absolute bottom-full left-0 right-0 mb-1 border border-gray-300 rounded-md bg-white shadow-lg z-10 animate-in fade-in slide-in-from-bottom-2 duration-150"
          style={{ maxHeight: '256px', overflowY: 'auto' }}
        >
          <div className="flex flex-wrap gap-1.5 p-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="pl-2 pr-1 py-0.5 text-xs font-medium shrink-0"
              >
                {tag}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions en dropdown */}
      {showSuggestions && suggestions.length > 0 && inputValue && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Hint discret */}
      {field.description && tags.length === 0 && (
        <p className="absolute -bottom-5 left-0 text-xs text-gray-400 whitespace-nowrap">
          💡 Appuyez sur Entrée pour ajouter
        </p>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 COMPOSANT PRINCIPAL - AUTO-DÉTECTION DU TYPE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface TechnicalSpecInputProps {
  field: SpecField;
  value: any;
  onChange: (value: any) => void;
}

export default function TechnicalSpecInput({ field, value, onChange }: TechnicalSpecInputProps) {
  switch (field.type) {
    case 'number':
      return <NumberInput field={field} value={value} onChange={onChange} />;
    
    case 'boolean':
      return <BooleanToggle field={field} value={value} onChange={onChange} />;
    
    case 'select':
      return <SelectDropdown field={field} value={value} onChange={onChange} />;
    
    case 'tags':
      return <TagsInput field={field} value={value} onChange={onChange} />;
    
    case 'text':
    default:
      return <TextInput field={field} value={value} onChange={onChange} />;
  }
}

