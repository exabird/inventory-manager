'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, Save, X, ExternalLink, Sparkles } from 'lucide-react';
import { Brand } from '@/lib/supabase';
import { BrandService } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    description: '',
    website: '',
    ai_fetch_prompt: '',
  });

  // Charger les marques
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      const data = await BrandService.getAll();
      setBrands(data);
    } catch (error) {
      console.error('❌ Erreur chargement marques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        slug: brand.slug,
        logo_url: brand.logo_url || '',
        description: brand.description || '',
        website: brand.website || '',
        ai_fetch_prompt: brand.ai_fetch_prompt || '',
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        slug: '',
        logo_url: '',
        description: '',
        website: '',
        ai_fetch_prompt: '',
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      logo_url: '',
      description: '',
      website: '',
      ai_fetch_prompt: '',
    });
  };

  const handleSave = async () => {
    try {
      // 🔄 Générer le slug automatiquement à partir du name
      const slug = formData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const dataToSave = {
        ...formData,
        slug,
      };

      if (editingBrand) {
        // Mise à jour
        await BrandService.update(editingBrand.id, dataToSave);
      } else {
        // Création
        await BrandService.create({
          ...dataToSave,
          ai_fetch_instructions: null,
        });
      }
      await loadBrands();
      handleCloseDialog();
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette marque ?')) return;
    
    try {
      await BrandService.delete(id);
      await loadBrands();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
    }
  };

  // Auto-génération du slug
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-purple-600" />
                Gestion des Marques
              </h1>
              <p className="text-gray-600 mt-2">
                Configurez les marques avec instructions IA personnalisées pour améliorer le fetch automatique
              </p>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une marque
            </Button>
          </div>
        </div>

        {/* Liste des marques */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : brands.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Aucune marque configurée</p>
            <Button onClick={() => handleOpenDialog()} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Créer la première marque
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Card key={brand.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="h-12 w-12 object-contain rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{brand.name}</h3>
                      <p className="text-xs text-gray-500">/{brand.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(brand)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(brand.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {brand.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {brand.description}
                  </p>
                )}

                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-3"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {new URL(brand.website).hostname}
                  </a>
                )}

                {brand.ai_fetch_prompt && (
                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    <Sparkles className="h-3 w-3 text-purple-600" />
                    <span className="text-xs">Instructions IA configurées</span>
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de création/édition */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? 'Modifier la marque' : 'Ajouter une marque'}
              </DialogTitle>
              <DialogDescription>
                Configurez les informations de la marque et les instructions IA personnalisées
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Nom */}
              <div>
                <Label htmlFor="name">Nom de la marque *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Sonos, Apple, Samsung..."
                />
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug">Slug (URL-friendly)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Ex: sonos, apple, samsung..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Généré automatiquement depuis le nom
                </p>
              </div>

              {/* Logo URL */}
              <div>
                <Label htmlFor="logo_url">URL du logo</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              {/* Site web */}
              <div>
                <Label htmlFor="website">Site web officiel</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.example.com"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Courte description de la marque..."
                  className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Prompt IA */}
              <div>
                <Label htmlFor="ai_fetch_prompt" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Instructions IA pour le fetch automatique
                </Label>
                <textarea
                  id="ai_fetch_prompt"
                  value={formData.ai_fetch_prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, ai_fetch_prompt: e.target.value }))}
                  placeholder="Ex: Chercher les informations sur https://www.sonos.com/fr-be/shop/. Les images produit sont en haute résolution. Extraire le nom exact, les spécifications techniques complètes..."
                  className="w-full min-h-[120px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ces instructions guideront l'IA pour améliorer la qualité du fetch automatique (sites spécifiques, formats d'images, etc.)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

