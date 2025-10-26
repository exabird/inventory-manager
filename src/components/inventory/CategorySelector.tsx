'use client';

import React, { useState, useEffect } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
}

interface CategorySelectorProps {
  value?: string | null;
  onChange: (categoryId: string | null, categoryName: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  className?: string;
}

export default function CategorySelector({
  value,
  onChange,
  onKeyDown,
  disabled,
  className
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(value || null);

  // Charger les catégories au montage
  useEffect(() => {
    loadCategories();
  }, []);

  // Synchroniser la valeur externe avec l'état local
  useEffect(() => {
    setSelectedCategoryId(value || null);
  }, [value]);

  /**
   * Charger toutes les catégories depuis Supabase
   */
  const loadCategories = async () => {
    try {
      console.log('📦 [CategorySelector] Chargement des catégories...');
      setIsLoading(true);

      const { data, error} = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ [CategorySelector] Erreur chargement:', error);
        throw error;
      }

      console.log(`✅ [CategorySelector] ${data?.length || 0} catégories chargées`);
      setCategories(data || []);

    } catch (error: any) {
      console.error('❌ [CategorySelector] Exception:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Créer une nouvelle catégorie (inline)
   */
  const handleCreateCategory = async () => {
    if (!newCategoryName || newCategoryName.trim() === '') {
      return;
    }

    try {
      console.log('➕ [CategorySelector] Création catégorie:', newCategoryName);

      const { data, error} = await supabase
        .from('categories')
        .insert([{
          name: newCategoryName.trim()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ [CategorySelector] Erreur création:', error);
        alert(`❌ Erreur: ${error.message}`);
        return;
      }

      console.log('✅ [CategorySelector] Catégorie créée:', data.id);

      // Ajouter la nouvelle catégorie à la liste
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));

      // Sélectionner automatiquement la nouvelle catégorie
      setSelectedCategoryId(data.id);
      onChange(data.id, data.name);

      // Réinitialiser
      setIsCreating(false);
      setNewCategoryName('');

    } catch (error: any) {
      console.error('❌ [CategorySelector] Exception création:', error.message);
      alert(`❌ Erreur: ${error.message}`);
    }
  };

  /**
   * Sélectionner une catégorie
   */
  const handleSelect = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      console.log('🎯 [CategorySelector] Sélection catégorie:', category.name);
      setSelectedCategoryId(categoryId);
      onChange(categoryId, category.name);
    }
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const displayName = selectedCategory?.name || 'Sélectionner une catégorie';

  return (
    <Select
      value={selectedCategoryId || undefined}
      onValueChange={handleSelect}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={cn("h-10", className)} onKeyDown={onKeyDown}>
        <SelectValue placeholder="Sélectionner une catégorie">
          {isLoading ? 'Chargement...' : displayName}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Liste des catégories existantes */}
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
        
        {/* Création inline nouvelle catégorie */}
        {isCreating ? (
          <div className="flex items-center gap-2 px-2 py-2 border-t">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nom de la catégorie..."
              className="h-8 text-sm flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateCategory();
                } else if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewCategoryName('');
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              className="h-8 w-8"
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => {
                setIsCreating(false);
                setNewCategoryName('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start h-9 px-2 border-t font-normal text-sm"
            onClick={(e) => {
              e.preventDefault();
              setIsCreating(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle catégorie
          </Button>
        )}
      </SelectContent>
    </Select>
  );
}

