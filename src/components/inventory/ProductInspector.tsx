'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  Trash2, 
  Save, 
  Loader2, 
  Barcode, 
  Hash, 
  Building2,
  DollarSign,
  Ruler,
  MapPin,
  Calendar,
  Tag,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Star,
  ShoppingCart,
  Truck,
  Globe,
  BarChart3,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FunctionalInput, FunctionalTextarea, FunctionalSelect } from '@/components/ui/FunctionalFields';
import { getFieldStatus } from '@/lib/fieldStatus';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Product, Category } from '@/lib/supabase';
import { CategoryService } from '@/lib/services';
import Tabs, { TabContent } from '@/components/ui/Tabs';
import ImageUploader from '@/components/inventory/ImageUploaderSquare';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import ProductThumbnail from '@/components/inventory/ProductThumbnail';
import { ProductImage } from '@/lib/productImageService';
import { ProductDetectionService } from '@/lib/productDetectionService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProductFormData {
  barcode: string | null;
  name: string;
  manufacturer: string | null;
  internal_ref: string | null;
  quantity: number;
  category_id: string | null;
  image_url: string | null;
  notes: string | null;
  // Nouvelles données essentielles
  manufacturer_ref: string | null;
  brand: string | null;
  short_description: string | null;
  selling_price_htva: number | null;
  purchase_price_htva: number | null;
  warranty_period: string | null;
  // Métadonnées étendues
  metadata: {
    supplier?: string | null;
    location?: string | null;
    weight?: number | null;
    dimensions?: string | null;
    expiration_date?: string | null;
    sku?: string | null;
    tags?: string[] | null;
    color?: string | null;
    material?: string | null;
    certifications?: string | null;
    manufacturing_date?: string | null;
    warranty_duration?: string | null;
    stock_date?: string | null;
    website?: string | null;
    external_links?: string[] | null;
    seo_keywords?: string[] | null;
    price_history?: Array<{date: string, price: number}> | null;
    stock_history?: Array<{date: string, quantity: number}> | null;
    internal_notes?: string | null;
  };
}

interface ProductInspectorProps {
  product?: Product | null;
  barcode?: string;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ProductInspector({
  product,
  barcode,
  onSubmit,
  onDelete,
  onClose,
  isLoading = false,
}: ProductInspectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    barcode: barcode || product?.barcode || '',
    name: product?.name || '',
    manufacturer: product?.manufacturer || '',
    internal_ref: product?.internal_ref || '',
    quantity: product?.quantity || 0,
    category_id: product?.category_id || '',
    image_url: product?.image_url || '',
    notes: product?.notes || '',
        manufacturer_ref: product?.manufacturer_ref || '',
        brand: product?.brand || '',
        short_description: product?.short_description || '',
        selling_price_htva: product?.selling_price_htva || null,
        purchase_price_htva: product?.purchase_price_htva || null,
        warranty_period: product?.warranty_period || '',
    metadata: {
      supplier: (product?.metadata as any)?.supplier || '',
      location: (product?.metadata as any)?.location || '',
      weight: (product?.metadata as any)?.weight || null,
      dimensions: (product?.metadata as any)?.dimensions || '',
      expiration_date: (product?.metadata as any)?.expiration_date || '',
      sku: (product?.metadata as any)?.sku || '',
      tags: (product?.metadata as any)?.tags || [],
      color: (product?.metadata as any)?.color || '',
      material: (product?.metadata as any)?.material || '',
      certifications: (product?.metadata as any)?.certifications || '',
      manufacturing_date: (product?.metadata as any)?.manufacturing_date || '',
      warranty_duration: (product?.metadata as any)?.warranty_duration || '',
      stock_date: (product?.metadata as any)?.stock_date || '',
      website: (product?.metadata as any)?.website || '',
      external_links: (product?.metadata as any)?.external_links || [],
      seo_keywords: (product?.metadata as any)?.seo_keywords || [],
      price_history: (product?.metadata as any)?.price_history || null,
      stock_history: (product?.metadata as any)?.stock_history || null,
      internal_notes: (product?.metadata as any)?.internal_notes || '',
    },
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const cats = await CategoryService.getAll();
        setCategories(cats);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Mettre à jour formData quand le produit change
  useEffect(() => {
    if (product) {
      setFormData({
        barcode: product.barcode || '',
        name: product.name || '',
        manufacturer: product.manufacturer || '',
        internal_ref: product.internal_ref || '',
        quantity: product.quantity || 0,
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        notes: product.notes || '',
          manufacturer_ref: product.manufacturer_ref || '',
          brand: product.brand || '',
          short_description: product.short_description || '',
          selling_price_htva: product.selling_price_htva || null,
          purchase_price_htva: product.purchase_price_htva || null,
          warranty_period: product.warranty_period || '',
        metadata: {
          supplier: (product.metadata as any)?.supplier || '',
          location: (product.metadata as any)?.location || '',
          weight: (product.metadata as any)?.weight || null,
          dimensions: (product.metadata as any)?.dimensions || '',
          expiration_date: (product.metadata as any)?.expiration_date || '',
          sku: (product.metadata as any)?.sku || '',
          tags: (product.metadata as any)?.tags || [],
          color: (product.metadata as any)?.color || '',
          material: (product.metadata as any)?.material || '',
          certifications: (product.metadata as any)?.certifications || '',
          manufacturing_date: (product.metadata as any)?.manufacturing_date || '',
          warranty_duration: (product.metadata as any)?.warranty_duration || '',
          stock_date: (product.metadata as any)?.stock_date || '',
          website: (product.metadata as any)?.website || '',
          external_links: (product.metadata as any)?.external_links || '',
          seo_keywords: (product.metadata as any)?.seo_keywords || '',
          price_history: (product.metadata as any)?.price_history || [],
          stock_history: (product.metadata as any)?.stock_history || [],
          internal_notes: (product.metadata as any)?.internal_notes || '',
        },
      });
    }
  }, [product]);

  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBarcodeScanned = async (scannedBarcode: string) => {
    console.log('📱 Code-barres scanné:', scannedBarcode);
    
    // Mettre à jour le code-barres immédiatement
    setFormData(prev => ({
      ...prev,
      barcode: scannedBarcode
    }));
    
    setShowScanner(false);
    
    // Détection automatique des informations produit
    try {
      console.log('🔍 Détection automatique des infos produit...');
      const detectedInfo = await ProductDetectionService.detectProductInfo(scannedBarcode);
      const validatedInfo = ProductDetectionService.validateDetectedData(detectedInfo);
      
      console.log('✅ Infos détectées:', validatedInfo);
      
      // Mettre à jour le formulaire avec les données détectées
      setFormData(prev => ({
        ...prev,
        name: prev.name || validatedInfo.name || '',
        brand: prev.brand || validatedInfo.brand || '',
        manufacturer: prev.manufacturer || validatedInfo.manufacturer || '',
        short_description: prev.short_description || validatedInfo.description || '',
        selling_price_htva: prev.selling_price_htva || validatedInfo.price || null,
        // Note: category_id nécessiterait une correspondance avec les catégories existantes
      }));
      
      // Afficher une notification de succès
      console.log('🎉 Informations produit automatiquement détectées et remplies !');
      
    } catch (error) {
      console.error('❌ Erreur lors de la détection automatique:', error);
      // Le code-barres est quand même rempli, mais pas les autres infos
    }
  };

  const handleMetadataChange = (field: string, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value || null
      }
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.internal_ref || formData.internal_ref.trim() === '') {
      errors.internal_ref = 'La référence interne est requise';
    }
    
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Le nom du produit est requis';
    }
    
    if (formData.quantity < 0) {
      errors.quantity = 'La quantité ne peut pas être négative';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const cleanedData = {
      ...formData,
      category_id: formData.category_id || null,
      manufacturer: formData.manufacturer || null,
      internal_ref: formData.internal_ref || null,
      image_url: formData.image_url || null,
      notes: formData.notes || null,
      manufacturer_ref: formData.manufacturer_ref,
      brand: formData.brand,
      short_description: formData.short_description,
      selling_price_htva: formData.selling_price_htva,
      purchase_price_htva: formData.purchase_price_htva,
      warranty_period: formData.warranty_period,
      metadata: {
        ...formData.metadata,
        supplier: formData.metadata?.supplier || null,
        location: formData.metadata?.location || null,
        weight: formData.metadata?.weight || null,
        dimensions: formData.metadata?.dimensions || null,
        expiration_date: formData.metadata?.expiration_date || null,
        sku: formData.metadata?.sku || null,
        tags: formData.metadata?.tags || null,
        color: formData.metadata?.color || null,
        material: formData.metadata?.material || null,
        certifications: formData.metadata?.certifications || null,
        manufacturing_date: formData.metadata?.manufacturing_date || null,
        warranty_duration: formData.metadata?.warranty_duration || null,
        stock_date: formData.metadata?.stock_date || null,
        website: formData.metadata?.website || null,
        external_links: formData.metadata?.external_links || null,
        seo_keywords: formData.metadata?.seo_keywords || null,
        price_history: formData.metadata?.price_history || null,
        stock_history: formData.metadata?.stock_history || null,
        internal_notes: formData.metadata?.internal_notes || null,
      },
    };
    
    try {
      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleDelete = async () => {
    if (product && onDelete) {
      await onDelete(product.id);
      setShowDeleteDialog(false);
      onClose();
    }
  };

  const getStockStatus = () => {
    if (formData.quantity === 0) {
      return { label: 'Rupture de stock', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else if (formData.quantity < 5) {
      return { label: 'Stock faible', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle };
    } else {
      return { label: 'En stock', color: 'bg-green-100 text-green-800', icon: Package };
    }
  };

  const stockStatus = getStockStatus();
  const StatusIcon = stockStatus.icon;

  // Définition des onglets
  const tabs = [
    {
      id: 'favorites',
      label: 'Favoris',
      icon: <Star className="h-4 w-4" />,
    },
    {
      id: 'stock',
      label: 'Stock',
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: 'supplier',
      label: 'Fournisseur',
      icon: <Truck className="h-4 w-4" />,
    },
    {
      id: 'specs',
      label: 'Spécifications',
      icon: <Ruler className="h-4 w-4" />,
    },
    {
      id: 'dates',
      label: 'Dates',
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: 'web',
      label: 'Web',
      icon: <Globe className="h-4 w-4" />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ];

  // Rendu du contenu des onglets
  const renderTabContent = () => {
    switch (activeTab) {
      case 'favorites':
        return (
          <TabContent>
            <div className="space-y-6">
              {/* Images produit */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Images produit
                </h3>
                <ImageUploader
                  productId={product?.id}
                  images={images}
                  onImagesChange={setImages}
                />
              </div>

              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Informations de base
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Nom du produit */}
                  <div className="col-span-2">
                    <FunctionalInput
                      id="name"
                      label="Nom du produit *"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: iPhone 15 Pro"
                      status={getFieldStatus('name')}
                      error={validationErrors.name}
                    />
                  </div>

                  {/* Référence fabricant */}
                  <FunctionalInput
                    id="manufacturer_ref"
                    label="Référence fabricant"
                    value={formData.manufacturer_ref || ''}
                    onChange={(e) => handleInputChange('manufacturer_ref', e.target.value)}
                    placeholder="REF-FAB-001"
                    status={getFieldStatus('manufacturer_ref')}
                  />

                  {/* Référence interne */}
                  <FunctionalInput
                    id="internal_ref"
                    label="Référence interne *"
                    value={formData.internal_ref || ''}
                    onChange={(e) => handleInputChange('internal_ref', e.target.value)}
                    placeholder="REF-INT-001"
                    status={getFieldStatus('internal_ref')}
                    error={validationErrors.internal_ref}
                  />

                  {/* Code-barres */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="barcode" className="flex items-center gap-1.5">
                        <Barcode className="h-3.5 w-3.5" />
                        Code-barres (SKU)
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowScanner(true)}
                        className="h-6 w-6 p-0"
                        title="Scanner le code-barres"
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    </div>
                    <FunctionalInput
                      id="barcode"
                      label=""
                      value={formData.barcode || ''}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      placeholder="1234567890123"
                      status={getFieldStatus('barcode')}
                    />
                  </div>

                  {/* Marque */}
                  <FunctionalInput
                    id="brand"
                    label="Marque"
                    value={formData.brand || ''}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Ex: Apple"
                    status={getFieldStatus('brand')}
                  />

                  {/* Catégorie */}
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="category_id">Catégorie</Label>
                    {isLoadingCategories ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <select
                        id="category_id"
                        value={formData.category_id || ''}
                        onChange={(e) => handleInputChange('category_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Aucune catégorie</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Description courte */}
                  <div className="col-span-2">
                    <FunctionalTextarea
                      id="short_description"
                      label="Description courte"
                      value={formData.short_description || ''}
                      onChange={(e) => handleInputChange('short_description', e.target.value)}
                      placeholder="Description courte du produit..."
                      rows={3}
                      status={getFieldStatus('short_description')}
                    />
                  </div>

                  {/* Période de garantie */}
                  <FunctionalInput
                    id="warranty_period"
                    label="Période de garantie"
                    value={formData.warranty_period || ''}
                    onChange={(e) => handleInputChange('warranty_period', e.target.value)}
                    placeholder="Ex: 2 ans"
                    status={getFieldStatus('warranty_period')}
                  />
                </div>
              </div>

              {/* Prix essentiels */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Prix essentiels
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Prix d'achat HTVA */}
                  <FunctionalInput
                    id="purchase_price_htva"
                    label="Prix d'achat HTVA (€)"
                    type="number"
                    step="0.01"
                    value={formData.purchase_price_htva || ''}
                    onChange={(e) => handleInputChange('purchase_price_htva', parseFloat(e.target.value))}
                    placeholder="0.00"
                    status={getFieldStatus('purchase_price_htva')}
                  />

                  {/* Prix de vente HTVA */}
                  <FunctionalInput
                    id="selling_price_htva"
                    label="Prix de vente HTVA (€)"
                    type="number"
                    step="0.01"
                    value={formData.selling_price_htva || ''}
                    onChange={(e) => handleInputChange('selling_price_htva', parseFloat(e.target.value))}
                    placeholder="0.00"
                    status={getFieldStatus('selling_price_htva')}
                  />
                </div>

                {/* Marge calculée */}
                {formData.purchase_price_htva && formData.selling_price_htva && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Marge bénéficiaire</span>
                      <span className="text-lg font-bold text-blue-600">
                        {((formData.selling_price_htva - formData.purchase_price_htva) / formData.purchase_price_htva * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      +{(formData.selling_price_htva - formData.purchase_price_htva).toFixed(2)}€ par unité
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabContent>
        );

      case 'stock':
        return (
          <TabContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Quantité */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité en stock</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    className={validationErrors.quantity ? 'border-red-500' : ''}
                  />
                </div>

                {/* SKU */}
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.metadata?.sku || ''}
                    onChange={(e) => handleMetadataChange('sku', e.target.value)}
                    placeholder="SKU-001"
                  />
                </div>

                {/* Emplacement */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="location">Emplacement</Label>
                  <Input
                    id="location"
                    value={formData.metadata?.location || ''}
                    onChange={(e) => handleMetadataChange('location', e.target.value)}
                    placeholder="Ex: Rayon A, Étagère 3"
                  />
                </div>
              </div>
            </div>
          </TabContent>
        );

      case 'supplier':
        return (
          <TabContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Fournisseur */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="supplier">Fournisseur</Label>
                  <Input
                    id="supplier"
                    value={formData.metadata?.supplier || ''}
                    onChange={(e) => handleMetadataChange('supplier', e.target.value)}
                    placeholder="Nom du fournisseur"
                  />
                </div>

                {/* Prix d'achat (reprise) */}
                <div className="space-y-2">
                  <Label htmlFor="purchase_price_context">Prix d'achat HTVA (€)</Label>
                  <Input
                    id="purchase_price_context"
                    type="number"
                    step="0.01"
                    value={formData.purchase_price_htva || ''}
                    onChange={(e) => handleInputChange('purchase_price_htva', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </TabContent>
        );

      case 'specs':
        return (
          <TabContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Poids */}
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5" />
                    Poids (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.001"
                    value={formData.metadata?.weight || ''}
                    onChange={(e) => handleMetadataChange('weight', parseFloat(e.target.value))}
                    placeholder="0.0"
                  />
                </div>

                {/* Dimensions */}
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.metadata?.dimensions || ''}
                    onChange={(e) => handleMetadataChange('dimensions', e.target.value)}
                    placeholder="L x l x h"
                  />
                </div>

                {/* Couleur */}
                <div className="space-y-2">
                  <Label htmlFor="color">Couleur</Label>
                  <Input
                    id="color"
                    value={formData.metadata?.color || ''}
                    onChange={(e) => handleMetadataChange('color', e.target.value)}
                    placeholder="Ex: Rouge"
                  />
                </div>

                {/* Matériau */}
                <div className="space-y-2">
                  <Label htmlFor="material">Matériau</Label>
                  <Input
                    id="material"
                    value={formData.metadata?.material || ''}
                    onChange={(e) => handleMetadataChange('material', e.target.value)}
                    placeholder="Ex: Plastique"
                  />
                </div>

                {/* Certifications */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Input
                    id="certifications"
                    value={formData.metadata?.certifications || ''}
                    onChange={(e) => handleMetadataChange('certifications', e.target.value)}
                    placeholder="Ex: CE, FCC"
                  />
                </div>
              </div>
            </div>
          </TabContent>
        );

      case 'dates':
        return (
          <TabContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Date d'expiration */}
                <div className="space-y-2">
                  <Label htmlFor="expiration_date" className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Date d'expiration
                  </Label>
                  <Input
                    id="expiration_date"
                    type="date"
                    value={formData.metadata?.expiration_date || ''}
                    onChange={(e) => handleMetadataChange('expiration_date', e.target.value)}
                  />
                </div>

                {/* Date de fabrication */}
                <div className="space-y-2">
                  <Label htmlFor="manufacturing_date">Date de fabrication</Label>
                  <Input
                    id="manufacturing_date"
                    type="date"
                    value={formData.metadata?.manufacturing_date || ''}
                    onChange={(e) => handleMetadataChange('manufacturing_date', e.target.value)}
                  />
                </div>

                {/* Garantie */}
                <div className="space-y-2">
                  <Label htmlFor="warranty_duration">Garantie</Label>
                  <Input
                    id="warranty_duration"
                    value={formData.metadata?.warranty_duration || ''}
                    onChange={(e) => handleMetadataChange('warranty_duration', e.target.value)}
                    placeholder="Ex: 2 ans"
                  />
                </div>

                {/* Date de mise en stock */}
                <div className="space-y-2">
                  <Label htmlFor="stock_date">Date de mise en stock</Label>
                  <Input
                    id="stock_date"
                    type="date"
                    value={formData.metadata?.stock_date || ''}
                    onChange={(e) => handleMetadataChange('stock_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabContent>
        );

      case 'web':
        return (
          <TabContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Site web */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="website">Site web fabricant</Label>
                  <Input
                    id="website"
                    value={formData.metadata?.website || ''}
                    onChange={(e) => handleMetadataChange('website', e.target.value)}
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>

                {/* Description courte (reprise) */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="short_description_ref">Description courte</Label>
                  <textarea
                    id="short_description_ref"
                    value={formData.short_description || ''}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    placeholder="Description courte du produit..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </TabContent>
        );

      case 'analytics':
        return (
          <TabContent>
            <div className="space-y-6">
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Analytics et historique</p>
                <p className="text-sm">Fonctionnalité à venir</p>
              </div>
            </div>
          </TabContent>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] lg:w-[600px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-3">
              {product && (
                <ProductThumbnail 
                  productId={product.id} 
                  size="md" 
                  className="border-2 border-white shadow-sm"
                />
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {product ? product.name : 'Nouveau produit'}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  {product?.manufacturer_ref && (
                    <p className="text-sm text-gray-600">
                      Ref: {product.manufacturer_ref}
                    </p>
                  )}
                        <Badge 
                          variant={product?.quantity === 0 ? 'destructive' : 
                                  (product?.quantity || 0) < 5 ? 'secondary' : 'default'}
                          className="text-xs font-medium"
                        >
                          {product?.quantity === 0 ? 'Rupture' : 
                           (product?.quantity || 0) < 5 ? 'Stock faible' : 'En stock'}
                        </Badge>
                        <span className="text-sm font-semibold text-gray-700">
                          {product?.quantity || 0} unités
                        </span>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Onglets */}
        <div className="px-6">
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Status Badge */}
            {product && (
              <div className="flex items-center gap-2 mb-6">
                <Badge className={`${stockStatus.color} px-3 py-1 text-sm font-medium`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {stockStatus.label}
                </Badge>
                {formData.quantity > 0 && (
                  <span className="text-sm text-gray-600">
                    {formData.quantity} unité{formData.quantity > 1 ? 's' : ''} disponible{formData.quantity > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}

            {/* Contenu des onglets */}
            {renderTabContent()}
          </div>
        </form>

        {/* Footer - Actions */}
        <div className="p-4 border-t bg-gray-50 space-y-3">
          {product && onDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer ce produit
            </Button>
          )}
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleFormSubmit}
              disabled={isLoading} 
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {product ? 'Mettre à jour' : 'Ajouter'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &ldquo;{product?.name}&rdquo; ?
              Cette action est irréversible et supprimera définitivement toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Scanner de code-barres */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Scanner Code-barres</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowScanner(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <BarcodeScanner
                onScanSuccess={handleBarcodeScanned}
                onClose={() => setShowScanner(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
