'use client';

import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
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

interface Brand {
  id: string;
  name: string;
  website?: string | null;
}

interface BrandSelectorProps {
  value?: string | null; // Brand ID
  brandName?: string | null; // Nom affiché pour compatibilité legacy
  onChange: (brandId: string | null, brandName: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  className?: string;
}

export default function BrandSelector({
  value,
  brandName,
  onChange,
  onKeyDown,
  disabled,
  className
}: BrandSelectorProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(value || null);

  // Charger les brands au montage
  useEffect(() => {
    loadBrands();
  }, []);

  // Synchroniser la valeur externe avec l'état local
  useEffect(() => {
    setSelectedBrandId(value || null);
  }, [value]);

  /**
   * Charger toutes les marques depuis Supabase
   */
  const loadBrands = async () => {
    try {
      console.log('📦 [BrandSelector] Chargement des marques...');
      setIsLoading(true);

      const { data, error} = await supabase
        .from('brands')
        .select('id, name, website')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ [BrandSelector] Erreur chargement:', error);
        throw error;
      }

      console.log(`✅ [BrandSelector] ${data?.length || 0} marques chargées`);
      setBrands(data || []);

    } catch (error: any) {
      console.error('❌ [BrandSelector] Exception:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Créer une nouvelle marque (inline)
   */
  const handleCreateBrand = async () => {
    if (!newBrandName || newBrandName.trim() === '') {
      return;
    }

    try {
      console.log('➕ [BrandSelector] Création marque:', newBrandName);

      const { data, error} = await supabase
        .from('brands')
        .insert([{
          name: newBrandName.trim(),
          website: null
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ [BrandSelector] Erreur création:', error);
        alert(`❌ Erreur: ${error.message}`);
        return;
      }

      console.log('✅ [BrandSelector] Marque créée:', data.id);

      // Ajouter la nouvelle marque à la liste
      setBrands(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));

      // Sélectionner automatiquement la nouvelle marque
      setSelectedBrandId(data.id);
      onChange(data.id, data.name);

      // Réinitialiser
      setIsCreating(false);
      setNewBrandName('');

    } catch (error: any) {
      console.error('❌ [BrandSelector] Exception création:', error.message);
      alert(`❌ Erreur: ${error.message}`);
    }
  };

  /**
   * Sélectionner une marque
   */
  const handleSelect = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      console.log('🎯 [BrandSelector] Sélection marque:', brand.name);
      setSelectedBrandId(brandId);
      onChange(brandId, brand.name);
    }
  };

  return (
    <Select
      value={selectedBrandId || undefined}
      onValueChange={handleSelect}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={cn("h-10", className)} onKeyDown={onKeyDown}>
        <SelectValue placeholder="Sélectionner une marque">
          {isLoading ? 'Chargement...' : (selectedBrandId ? brands.find(b => b.id === selectedBrandId)?.name || brandName : 'Sélectionner une marque')}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Liste des marques existantes */}
        {brands.map((brand) => (
          <SelectItem key={brand.id} value={brand.id}>
            {brand.name}
          </SelectItem>
        ))}
        
        {/* Création inline nouvelle marque */}
        {isCreating ? (
          <div className="flex items-center gap-2 px-2 py-2 border-t">
            <Input
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Nom de la marque..."
              className="h-8 text-sm flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateBrand();
                } else if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewBrandName('');
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              className="h-8 w-8"
              onClick={handleCreateBrand}
              disabled={!newBrandName.trim()}
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
                setNewBrandName('');
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
            Nouvelle marque
          </Button>
        )}
      </SelectContent>
    </Select>
  );
}

