# 🏢 PLAN D'ACTION - SYSTÈME DE GESTION DES MARQUES

## Date : 23 Octobre 2025

---

## 🎯 OBJECTIFS

1. **Créer une base de données de marques** réutilisable
2. **Combobox intelligent** pour sélection/ajout rapide
3. **Récupération automatique** des logos depuis URL
4. **Affichage des logos** dans l'interface produit
5. **UX/UI optimale** avec Shadcn

---

## 📋 PLAN D'ACTION DÉTAILLÉ

### Phase 1 : Base de données (30 min)

#### 1.1. Créer la table `brands`

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,                    -- Nom de la marque
  slug TEXT NOT NULL UNIQUE,                     -- Slug pour URL (ex: "apple")
  website_url TEXT,                              -- URL du site officiel
  logo_url TEXT,                                 -- URL du logo (stockage Supabase)
  logo_storage_path TEXT,                        -- Chemin dans Storage
  description TEXT,                              -- Description optionnelle
  metadata JSONB DEFAULT '{}',                   -- Infos supplémentaires
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_brands_slug ON brands(slug);

-- RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Accès public lecture" ON brands FOR SELECT USING (true);
CREATE POLICY "Accès public écriture" ON brands FOR ALL USING (true);
```

#### 1.2. Créer le bucket Storage pour logos

```sql
-- Via Supabase Dashboard ou MCP
-- Créer bucket : brand-logos
-- Public : true
-- Taille max fichier : 2MB
-- Types acceptés : image/png, image/jpeg, image/svg+xml, image/webp
```

#### 1.3. Modifier la table `products`

```sql
-- Ajouter une relation vers la table brands
ALTER TABLE products 
ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- Index
CREATE INDEX idx_products_brand_id ON products(brand_id);

-- Le champ "brand" TEXT reste pour compatibilité ascendante
-- Il sera progressivement remplacé par brand_id
```

---

### Phase 2 : Services (45 min)

#### 2.1. Créer `brandService.ts`

```typescript
// src/lib/brandService.ts

import { supabase, STORAGE_BUCKETS } from './supabase';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  logo_url: string | null;
  logo_storage_path: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const BrandService = {
  // Récupérer toutes les marques
  async getAll(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Erreur chargement marques:', error);
      return [];
    }
    
    return data || [];
  },

  // Récupérer une marque par nom
  async getByName(name: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('name', name)
      .single();
    
    if (error) return null;
    return data;
  },

  // Créer une nouvelle marque
  async create(brandData: Partial<Brand>): Promise<Brand | null> {
    const slug = brandData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
    
    const { data, error } = await supabase
      .from('brands')
      .insert([{
        ...brandData,
        slug
      }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur création marque:', error);
      return null;
    }
    
    return data;
  },

  // Récupérer le logo depuis une URL de site web
  async fetchLogoFromWebsite(websiteUrl: string): Promise<string | null> {
    try {
      // Appeler notre API route pour récupérer le logo
      const response = await fetch('/api/fetch-brand-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.logoUrl || null;
    } catch (error) {
      console.error('❌ Erreur récupération logo:', error);
      return null;
    }
  },

  // Upload du logo
  async uploadLogo(brandId: string, file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${brandId}-logo.${fileExt}`;
    const filePath = `${brandId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('brand-logos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('❌ Erreur upload logo:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('brand-logos')
      .getPublicUrl(filePath);

    // Mettre à jour la marque avec le chemin du logo
    await supabase
      .from('brands')
      .update({ 
        logo_url: data.publicUrl,
        logo_storage_path: filePath 
      })
      .eq('id', brandId);

    return data.publicUrl;
  }
};
```

#### 2.2. Créer l'API route pour récupérer les logos

```typescript
// src/app/api/fetch-brand-logo/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 });
    }

    // Récupérer la page HTML
    const response = await fetch(url);
    const html = await response.text();
    
    // Extraire le logo depuis les meta tags
    // Rechercher dans cet ordre :
    // 1. <meta property="og:image">
    // 2. <link rel="icon"> ou <link rel="apple-touch-icon">
    // 3. /favicon.ico
    
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i);
    
    let logoUrl = null;
    
    if (ogImageMatch) {
      logoUrl = ogImageMatch[1];
    } else if (faviconMatch) {
      logoUrl = faviconMatch[1];
    } else {
      // Fallback sur favicon.ico
      const urlObj = new URL(url);
      logoUrl = `${urlObj.origin}/favicon.ico`;
    }
    
    // Résoudre les URL relatives
    if (logoUrl && !logoUrl.startsWith('http')) {
      const urlObj = new URL(url);
      logoUrl = new URL(logoUrl, urlObj.origin).toString();
    }
    
    return NextResponse.json({ logoUrl });
    
  } catch (error) {
    console.error('Erreur récupération logo:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération du logo' 
    }, { status: 500 });
  }
}
```

---

### Phase 3 : Composant Combobox de marques (1h)

#### 3.1. Composant `BrandCombobox`

**Design UX optimal inspiré de Shadcn :**

```tsx
// src/components/inventory/BrandCombobox.tsx

'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, Globe, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BrandService, Brand } from '@/lib/brandService';

interface BrandComboboxProps {
  value?: string | null;
  onChange: (brandId: string, brandName: string) => void;
  className?: string;
}

export default function BrandCombobox({ value, onChange, className }: BrandComboboxProps) {
  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog pour ajouter une marque
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandWebsite, setNewBrandWebsite] = useState('');
  const [isFetchingLogo, setIsFetchingLogo] = useState(false);
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string | null>(null);

  // Charger les marques
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setIsLoading(true);
    const brandsData = await BrandService.getAll();
    setBrands(brandsData);
    
    if (value) {
      const brand = brandsData.find(b => b.id === value || b.name === value);
      setSelectedBrand(brand || null);
    }
    
    setIsLoading(false);
  };

  const handleSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    onChange(brand.id, brand.name);
    setOpen(false);
  };

  const handleFetchLogo = async () => {
    if (!newBrandWebsite) return;
    
    setIsFetchingLogo(true);
    const logoUrl = await BrandService.fetchLogoFromWebsite(newBrandWebsite);
    setPreviewLogoUrl(logoUrl);
    setIsFetchingLogo(false);
  };

  const handleCreateBrand = async () => {
    if (!newBrandName) return;
    
    const newBrand = await BrandService.create({
      name: newBrandName,
      website_url: newBrandWebsite || null,
      logo_url: previewLogoUrl,
    });
    
    if (newBrand) {
      await loadBrands();
      handleSelectBrand(newBrand);
      setShowAddDialog(false);
      setNewBrandName('');
      setNewBrandWebsite('');
      setPreviewLogoUrl(null);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
          >
            {selectedBrand ? (
              <div className="flex items-center gap-2">
                {selectedBrand.logo_url && (
                  <img 
                    src={selectedBrand.logo_url} 
                    alt={selectedBrand.name}
                    className="h-4 w-4 rounded object-contain"
                  />
                )}
                {selectedBrand.name}
              </div>
            ) : (
              "Sélectionner une marque..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Rechercher une marque..." />
            <CommandEmpty>
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Aucune marque trouvée
                </p>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setShowAddDialog(true);
                    setOpen(false);
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Créer cette marque
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {brands.map((brand) => (
                <CommandItem
                  key={brand.id}
                  value={brand.name}
                  onSelect={() => handleSelectBrand(brand)}
                  className="gap-2"
                >
                  {brand.logo_url && (
                    <img 
                      src={brand.logo_url} 
                      alt={brand.name}
                      className="h-5 w-5 rounded object-contain"
                    />
                  )}
                  <span>{brand.name}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedBrand?.id === brand.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            
            {/* Bouton ajouter en bas */}
            <div className="border-t p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={() => {
                  setShowAddDialog(true);
                  setOpen(false);
                }}
              >
                <Plus className="h-4 w-4" />
                Ajouter une nouvelle marque
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Dialog pour ajouter une marque */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle marque</DialogTitle>
            <DialogDescription>
              Créez une marque réutilisable avec son logo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Nom de la marque */}
            <div className="space-y-2">
              <Label htmlFor="brand-name">Nom de la marque *</Label>
              <Input
                id="brand-name"
                placeholder="Ex: Apple, Samsung..."
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
              />
            </div>

            {/* URL du site */}
            <div className="space-y-2">
              <Label htmlFor="brand-website">Site web (optionnel)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="brand-website"
                    type="url"
                    placeholder="https://www.apple.com"
                    value={newBrandWebsite}
                    onChange={(e) => setNewBrandWebsite(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleFetchLogo}
                  disabled={!newBrandWebsite || isFetchingLogo}
                  title="Récupérer le logo automatiquement"
                >
                  {isFetchingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Le logo sera récupéré automatiquement depuis le site
              </p>
            </div>

            {/* Prévisualisation du logo */}
            {previewLogoUrl && (
              <div className="space-y-2">
                <Label>Aperçu du logo</Label>
                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
                  <img 
                    src={previewLogoUrl} 
                    alt="Logo" 
                    className="h-12 w-12 rounded object-contain bg-white p-1"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Logo récupéré avec succès</p>
                    <p className="text-xs text-muted-foreground truncate">{previewLogoUrl}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload manuel (alternative) */}
            <div className="space-y-2">
              <Label htmlFor="brand-logo-upload">Ou uploader un logo manuellement</Label>
              <Input
                id="brand-logo-upload"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Créer une preview locale
                    const reader = new FileReader();
                    reader.onload = (e) => setPreviewLogoUrl(e.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateBrand} disabled={!newBrandName}>
              Créer la marque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

### Phase 4 : Intégration dans ProductInspector (30 min)

#### 4.1. Remplacer le champ "Marque" par BrandCombobox

```tsx
// Dans ProductInspector.tsx

import BrandCombobox from './BrandCombobox';

// Dans le formulaire :
<div className="space-y-2">
  <Label>Marque</Label>
  <BrandCombobox
    value={formData.brand_id}
    onChange={(brandId, brandName) => {
      setFormData(prev => ({
        ...prev,
        brand_id: brandId,
        brand: brandName  // Compatibilité
      }));
    }}
  />
</div>
```

#### 4.2. Afficher le logo dans le header de l'inspecteur

```tsx
// Dans ProductInspector.tsx - Header

{selectedBrand?.logo_url && (
  <div className="flex-shrink-0">
    <img 
      src={selectedBrand.logo_url} 
      alt={selectedBrand.name}
      className="h-10 w-10 rounded-md object-contain bg-white p-1.5 border shadow-sm"
    />
  </div>
)}

<div className="flex-1">
  <h2 className="text-lg font-bold">{product.name}</h2>
  {selectedBrand && (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{selectedBrand.name}</span>
      {selectedBrand.website_url && (
        <a 
          href={selectedBrand.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          <Globe className="h-3 w-3" />
        </a>
      )}
    </div>
  )}
</div>
```

---

### Phase 5 : Affichage dans la liste (15 min)

#### 5.1. Afficher les logos dans la table

```tsx
// Dans CompactProductListItem.tsx

{columnVisibility.brand && (
  <div className="flex-shrink-0 w-24">
    {product.brands ? (  // Join avec la table brands
      <div className="flex items-center gap-2">
        {product.brands.logo_url && (
          <img 
            src={product.brands.logo_url} 
            alt={product.brands.name}
            className="h-5 w-5 rounded object-contain"
          />
        )}
        <span className="text-xs truncate">{product.brands.name}</span>
      </div>
    ) : product.brand ? (
      <Badge variant="outline" className="text-xs">
        <Building2 className="h-3 w-3 mr-1" />
        {product.brand}
      </Badge>
    ) : (
      <span className="text-xs text-muted-foreground">-</span>
    )}
  </div>
)}
```

#### 5.2. Modifier la requête ProductService

```typescript
// Dans services.ts

async getAll(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(name),
      brands(id, name, logo_url, website_url)
    `)
    .order('created_at', { ascending: false });
  
  // ...
}
```

---

## 🎨 DESIGN UX/UI PROPOSÉ

### 1. **Combobox intelligent (inspiré Shadcn)**

**Avantages :**
- ✅ Recherche rapide (Command component)
- ✅ Affichage du logo dans la liste
- ✅ Bouton "Ajouter" si non trouvé
- ✅ Keyboard navigation
- ✅ Accessible (ARIA)

**Flow utilisateur :**
```
1. Clic sur le combobox
2. Recherche "Apple"
   → Si trouvé : Liste avec logo + nom
   → Si non trouvé : Bouton "Créer cette marque"
3. Sélection ou création
4. Logo affiché automatiquement dans l'interface
```

### 2. **Dialog d'ajout de marque**

**Interface en 3 sections :**

**Section 1 : Informations de base**
- Input : Nom de la marque (required)
- Input : URL du site (optional)
- Bouton : Récupérer le logo (icône Upload)

**Section 2 : Logo automatique**
- Si URL fournie → Bouton "Récupérer le logo"
- Affiche une preview si trouvé
- Indication de la source (favicon, og:image, etc.)

**Section 3 : Upload manuel (fallback)**
- Input file pour upload manuel
- Preview du fichier uploadé
- Support : PNG, JPG, SVG, WebP

**Footer :**
- Bouton "Annuler" (outline)
- Bouton "Créer la marque" (primary)

### 3. **Affichage dans ProductInspector**

**Header enrichi :**
```
┌─────────────────────────────────────┐
│ [Logo]  Sonos Beam                  │
│         Sonos [🌐]                   │
│         #SONOS-BEAM                  │
│         📦 15  💰 449.00€            │
└─────────────────────────────────────┘
```

**Avantages :**
- ✅ Identification visuelle immédiate (logo)
- ✅ Lien vers le site de la marque
- ✅ Informations condensées et lisibles

### 4. **Affichage dans la liste**

**Colonne marque avec logo :**
```
[Logo] Apple
[Logo] Samsung
[Logo] Sonos
```

**Si pas de logo :**
```
[🏢] Generic Brand
```

---

## 🔄 WORKFLOW UTILISATEUR COMPLET

### Scénario 1 : Marque existante

```
1. Éditer un produit
2. Clic sur champ "Marque"
3. Taper "Son" → Autocomplete "Sonos"
4. Sélectionner → Logo affiché automatiquement
5. Sauvegarder
```

### Scénario 2 : Nouvelle marque avec site web

```
1. Éditer un produit
2. Clic sur champ "Marque"
3. Taper "Bose" → Non trouvé
4. Clic sur "Créer cette marque"
5. Dialog s'ouvre avec "Bose" pré-rempli
6. Coller URL : https://www.bose.com
7. Clic sur bouton "Récupérer le logo"
8. Logo affiché en preview
9. Clic "Créer la marque"
10. Marque créée avec logo → Appliquée au produit
11. Logo visible partout dans l'app
```

### Scénario 3 : Nouvelle marque sans site (fallback)

```
1. Éditer un produit
2. Clic sur champ "Marque"
3. Taper "Marque Locale" → Non trouvé
4. Clic sur "Créer cette marque"
5. Entrer "Marque Locale"
6. Upload manuel du logo (optionnel)
7. Clic "Créer la marque"
8. Marque créée → Appliquée au produit
```

---

## 🎨 MOCKUPS UI (Description)

### Combobox fermé

```
┌─────────────────────────────────────┐
│ [Logo] Apple              [▼]       │
└─────────────────────────────────────┘
```

### Combobox ouvert

```
┌─────────────────────────────────────┐
│ 🔍 Rechercher une marque...         │
├─────────────────────────────────────┤
│ [Logo] Apple                    [✓] │
│ [Logo] Samsung                      │
│ [Logo] Sonos                        │
│ [Logo] Sony                         │
│ [🏢]   Generic Brand                │
├─────────────────────────────────────┤
│ ➕ Ajouter une nouvelle marque      │
└─────────────────────────────────────┘
```

### Dialog d'ajout

```
┌─────────────────────────────────────────┐
│ Ajouter une nouvelle marque        [X]  │
├─────────────────────────────────────────┤
│                                         │
│ Nom de la marque *                      │
│ ┌─────────────────────────────────────┐ │
│ │ Bose                                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Site web (optionnel)                    │
│ ┌─────────────────────────────────────┐ │
│ │ 🌐 https://www.bose.com       [📥] │ │
│ └─────────────────────────────────────┘ │
│ Le logo sera récupéré automatiquement   │
│                                         │
│ Aperçu du logo                          │
│ ┌─────────────────────────────────────┐ │
│ │ [Logo]  Logo récupéré avec succès   │ │
│ │         https://bose.com/logo.png   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Ou uploader un logo manuellement        │
│ ┌─────────────────────────────────────┐ │
│ │ [📁 Choisir un fichier]             │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│              [Annuler]  [Créer la marque] │
└─────────────────────────────────────────┘
```

---

## 🚀 AVANTAGES DE CETTE APPROCHE

### UX

✅ **Gain de temps** - Pas besoin de retaper les marques  
✅ **Autocomplete** - Recherche rapide  
✅ **Logos automatiques** - Récupération depuis le site  
✅ **Fallback manuel** - Upload si automatique échoue  
✅ **Réutilisable** - Base de données partagée  
✅ **Visuel** - Logos partout dans l'interface  

### Données

✅ **Normalisation** - Marques cohérentes  
✅ **Enrichissement** - URL, logos, metadata  
✅ **Relations** - Foreign key vers products  
✅ **Évolutivité** - Facile d'ajouter des infos  

### Maintenance

✅ **Centralisé** - Une seule source de vérité  
✅ **Modifiable** - Changer le logo d'une marque = change partout  
✅ **Statistiques** - Facile de compter produits par marque  

---

## 📅 PLANNING DE DÉVELOPPEMENT

### Aujourd'hui (2-3h)

- [x] ✅ Plan d'action créé
- [ ] 🔄 Créer la table `brands` (30 min)
- [ ] 🔄 Créer le bucket Storage (5 min)
- [ ] 🔄 Créer `brandService.ts` (30 min)
- [ ] 🔄 Créer l'API route `fetch-brand-logo` (20 min)
- [ ] 🔄 Créer le composant `BrandCombobox` (45 min)

### Demain (1-2h)

- [ ] Intégrer dans ProductInspector
- [ ] Modifier ProductService pour inclure les brands
- [ ] Afficher les logos dans la liste
- [ ] Tests complets

### Cette semaine

- [ ] Migration des marques existantes
- [ ] Récupération automatique des logos pour marques existantes
- [ ] Documentation utilisateur
- [ ] Déploiement

---

## 💾 MIGRATION DES DONNÉES EXISTANTES

### Script de migration

```sql
-- 1. Créer les marques uniques depuis les produits existants
INSERT INTO brands (name, slug)
SELECT DISTINCT 
  COALESCE(brand, manufacturer) as name,
  LOWER(REGEXP_REPLACE(COALESCE(brand, manufacturer), '[^a-zA-Z0-9]+', '-', 'g')) as slug
FROM products
WHERE COALESCE(brand, manufacturer) IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- 2. Mettre à jour les produits avec les brand_id
UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE p.brand = b.name OR p.manufacturer = b.name;

-- 3. Vérification
SELECT 
  COUNT(*) as total_products,
  COUNT(brand_id) as products_with_brand_id,
  COUNT(DISTINCT brand_id) as unique_brands
FROM products;
```

---

## 🎯 PROPOSITION D'AMÉLIORATION ADDITIONNELLE

### Option 1 : Marques "officielles" vs "custom"

Ajouter un champ `is_official` dans la table `brands` :
- **Marques officielles** : Apple, Samsung, Sony (avec logos vérifiés)
- **Marques custom** : Marques locales sans logo

**Affichage :**
- Officielles en premier dans la liste
- Icône étoile ⭐ pour les officielles

### Option 2 : Cache des logos

Stocker les logos dans Supabase Storage plutôt que lier vers l'URL externe :
- ✅ Performance (pas de requête externe)
- ✅ Disponibilité (pas de dépendance externe)
- ✅ Taille optimisée (resize automatique)

### Option 3 : Métadonnées de marque

Stocker dans `metadata` :
```json
{
  "country": "USA",
  "founded_year": 1976,
  "category": "Electronics",
  "social": {
    "twitter": "@apple",
    "instagram": "@apple"
  }
}
```

**Affichage :**
- Tooltip au hover du logo
- Section "À propos de la marque" dans l'inspecteur

---

## ✅ RECOMMANDATIONS FINALES

### Priorité 1 (Essentiel)

1. ✅ Table `brands` avec logo_url
2. ✅ Combobox Shadcn pour sélection
3. ✅ Récupération automatique du logo
4. ✅ Affichage dans l'inspecteur

### Priorité 2 (Important)

1. Dialog d'ajout de marque
2. Upload manuel de logo
3. Affichage dans la liste
4. Migration des données existantes

### Priorité 3 (Nice to have)

1. Marques "officielles" vs "custom"
2. Cache des logos dans Storage
3. Métadonnées de marque étendues
4. Page de gestion des marques

---

## 🎊 IMPACT ATTENDU

### Pour l'utilisateur

✅ **Gain de temps** : 80% (pas besoin de retaper)  
✅ **Cohérence** : 100% (orthographe unifiée)  
✅ **Visual** : Reconnaissance immédiate par logo  
✅ **Productivité** : +50% sur la saisie  

### Pour les données

✅ **Qualité** : Données normalisées  
✅ **Richesse** : Logos + URLs + metadata  
✅ **Statistiques** : Analyse par marque facilitée  
✅ **Évolutivité** : Facile d'ajouter des infos  

---

## 🤔 QUESTIONS À VALIDER

1. **Voulez-vous commencer par Phase 1** (BDD + Services) **aujourd'hui ?**
2. **Préférez-vous** un design encore plus sobre ou l'actuel est OK ?
3. **Souhaitez-vous** inclure les métadonnées étendues de marque (Option 3) ?
4. **Voulez-vous** migrer les marques existantes automatiquement ?

---

**📝 Ce plan d'action est prêt à être exécuté. Dites-moi par quelle phase commencer !**

