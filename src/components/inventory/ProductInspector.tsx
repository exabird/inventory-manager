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
  Camera,
  ArrowDownToLine,
  ArrowUpFromLine,
  Hash as HashIcon,
  Edit,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FunctionalInput, FunctionalTextarea, FunctionalSelect } from '@/components/ui/FunctionalFields';
import { getFieldStatus } from '@/lib/fieldStatus';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AIInputWrapper } from '@/components/ui/AIFieldIndicator';
import { Product, Category } from '@/lib/supabase';
import { CategoryService } from '@/lib/services';
import Tabs, { TabContent } from '@/components/ui/Tabs';
import ImageUploader from '@/components/inventory/ImageUploaderSquare';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import ProductThumbnail from '@/components/inventory/ProductThumbnail';
import { ProductImage } from '@/lib/productImageService';
import { ProductDetectionService } from '@/lib/productDetectionService';
import StockTab from '@/components/inventory/StockTab';
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
  min_stock_required: boolean | null;
  min_stock_quantity: number | null;
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
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState<ProductFormData | null>(null);
  const [showImageGallery, setShowImageGallery] = useState(false);
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
        min_stock_required: product?.min_stock_required || false,
        min_stock_quantity: product?.min_stock_quantity || 0,
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
  
  // États pour le remplissage IA (Fonction 2)
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  const [isAILoading, setIsAILoading] = useState(false);

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const cats = await CategoryService.getAll();
        setCategories(cats);
      } catch (error) {
        console.warn('⚠️ Erreur lors du chargement des catégories:', error);
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
      const initialData = {
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
        min_stock_required: product.min_stock_required || false,
        min_stock_quantity: product.min_stock_quantity || 0,
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
      };
      
      setFormData(initialData);
      setInitialFormData(initialData);
      setHasChanges(false);
    }
  }, [product]);

  // Détecter les modifications en temps réel
  useEffect(() => {
    if (initialFormData) {
      const hasModifications = checkForChanges(formData);
      setHasChanges(hasModifications);
    }
  }, [formData, initialFormData]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && hasChanges) {
      e.preventDefault();
      handleFormSubmit(e as any);
    }
  };

  const handleStockUpdate = (newQuantity: number) => {
    // Mettre à jour la quantité dans le formulaire
    setFormData(prev => ({
      ...prev,
      quantity: newQuantity
    }));
    
    // Mettre à jour le produit localement si nécessaire
    if (product) {
      // Cette fonction sera appelée par le StockTab pour synchroniser les données
    }
  };

  // Fonction pour détecter les modifications
  const checkForChanges = (currentData: ProductFormData) => {
    if (!initialFormData) return false;
    
    // Comparer les champs principaux
    const mainFields: (keyof ProductFormData)[] = [
      'barcode', 'name', 'manufacturer', 'internal_ref', 'quantity',
      'category_id', 'image_url', 'notes', 'manufacturer_ref', 'brand',
      'short_description', 'selling_price_htva', 'purchase_price_htva', 'warranty_period'
    ];
    
    for (const field of mainFields) {
      if (currentData[field] !== initialFormData[field]) {
        return true;
      }
    }
    
    // Comparer les métadonnées
    if (JSON.stringify(currentData.metadata) !== JSON.stringify(initialFormData.metadata)) {
      return true;
    }
    
    return false;
  };

  const handleBarcodeScanned = async (scannedBarcode: string) => {
    try {
      console.log('📱 [ProductInspector] Code-barres reçu du scanner:', scannedBarcode);
      console.log('📱 [ProductInspector] Type:', typeof scannedBarcode);
      console.log('📱 [ProductInspector] Longueur:', scannedBarcode?.length);
      
      // Vérifier que le code n'est pas vide
      if (!scannedBarcode || scannedBarcode.trim() === '') {
        console.error('❌ [ProductInspector] Code-barres vide reçu !');
        setShowScanner(false);
        return;
      }
      
      // Fermer le scanner d'abord
      console.log('🔒 [ProductInspector] Fermeture du scanner');
      setShowScanner(false);
      
      // Mettre à jour le code-barres immédiatement
      console.log('📝 [ProductInspector] Mise à jour du formData avec le code:', scannedBarcode);
      setFormData(prev => {
        const newData = {
          ...prev,
          barcode: scannedBarcode
        };
        console.log('✅ [ProductInspector] FormData mis à jour:', newData.barcode);
        return newData;
      });
      
      // Détection automatique des informations produit (optionnel)
      try {
        console.log('🔍 [ProductInspector] Détection automatique des infos produit...');
        const detectedInfo = await ProductDetectionService.detectProductInfo(scannedBarcode);
        const validatedInfo = ProductDetectionService.validateDetectedData(detectedInfo);
        
        console.log('✅ [ProductInspector] Infos détectées:', validatedInfo);
        
        // Mettre à jour le formulaire avec les données détectées
        setFormData(prev => ({
          ...prev,
          name: prev.name || validatedInfo.name || '',
          brand: prev.brand || validatedInfo.brand || '',
          manufacturer: prev.manufacturer || validatedInfo.manufacturer || '',
          short_description: prev.short_description || validatedInfo.description || '',
          selling_price_htva: prev.selling_price_htva || validatedInfo.price || null,
        }));
        
        console.log('🎉 [ProductInspector] Informations produit automatiquement détectées et remplies !');
        
      } catch (error) {
        console.warn('⚠️ [ProductInspector] Erreur lors de la détection automatique:', error);
        console.warn('⚠️ [ProductInspector] Le code-barres est quand même rempli');
        // Le code-barres est quand même rempli, pas grave si la détection échoue
      }
      
    } catch (error) {
      console.error('❌ [ProductInspector] Erreur critique dans handleBarcodeScanned:', error);
      // S'assurer que le scanner est fermé même en cas d'erreur
      setShowScanner(false);
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
    
    // La référence interne n'est plus obligatoire - sera générée automatiquement si vide
    // if (!formData.internal_ref || formData.internal_ref.trim() === '') {
    //   errors.internal_ref = 'La référence interne est requise';
    // }
    
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Le nom du produit est requis';
    }
    
    if (formData.quantity < 0) {
      errors.quantity = 'La quantité ne peut pas être négative';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 🤖 FONCTION 2 : Remplissage IA Avancé
   * Appelé manuellement via le bouton IA
   * Utilise Claude pour rechercher et remplir les informations complètes
   */
  const handleAIFill = async () => {
    try {
      console.log('🤖 [Fonction 2] Début remplissage IA');
      setIsAILoading(true);
      
      // Appeler l'API Claude
      const response = await fetch('/api/ai-fill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productData: formData
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'appel à l\'API IA');
      }
      
      const result = await response.json();
      console.log('✅ [Fonction 2] Données IA reçues:', result.data);
      
      // Marquer les champs qui seront remplis par l'IA
      const filledFields = new Set<string>();
      
      // Mettre à jour formData avec les données IA
      setFormData(prev => {
        const aiData = result.data;
        const updated: any = { ...prev };
        
        // Remplir les champs de base
        if (aiData.name) {
          updated.name = aiData.name;
          filledFields.add('name');
        }
        if (aiData.brand) {
          updated.brand = aiData.brand;
          filledFields.add('brand');
        }
        if (aiData.manufacturer) {
          updated.manufacturer = aiData.manufacturer;
          filledFields.add('manufacturer');
        }
        if (aiData.manufacturer_ref) {
          updated.manufacturer_ref = aiData.manufacturer_ref;
          filledFields.add('manufacturer_ref');
        }
        if (aiData.short_description) {
          updated.short_description = aiData.short_description;
          filledFields.add('short_description');
        }
        if (aiData.long_description) {
          updated.notes = aiData.long_description;
          filledFields.add('notes');
        }
        if (aiData.selling_price_htva) {
          updated.selling_price_htva = aiData.selling_price_htva;
          filledFields.add('selling_price_htva');
        }
        if (aiData.warranty_period) {
          updated.warranty_period = aiData.warranty_period;
          filledFields.add('warranty_period');
        }
        if (aiData.category) {
          // Chercher la catégorie correspondante
          const matchingCategory = categories.find(
            cat => cat.name.toLowerCase() === aiData.category.toLowerCase()
          );
          if (matchingCategory) {
            updated.category_id = matchingCategory.id;
            filledFields.add('category_id');
          }
        }
        
        // Ajouter les spécifications dans les métadonnées
        if (aiData.specifications) {
          updated.metadata = {
            ...prev.metadata,
            ...aiData.specifications
          };
        }
        
        return updated;
      });
      
      // Sauvegarder les champs remplis par l'IA
      setAiFilledFields(filledFields);
      
      console.log('🎉 [Fonction 2] Formulaire rempli par IA !');
      console.log('🤖 Champs modifiés:', Array.from(filledFields));
      
    } catch (error: any) {
      console.error('❌ [Fonction 2] Erreur:', error);
      alert(`Erreur lors du remplissage IA: ${error.message}`);
    } finally {
      setIsAILoading(false);
    }
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
      min_stock_required: formData.min_stock_required,
      min_stock_quantity: formData.min_stock_quantity,
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
      console.warn('⚠️ Erreur lors de la soumission:', error);
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
              {/* Informations de base */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Informations de base
                  </h3>
                  
                  {/* 🤖 Bouton IA (Fonction 2) */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAIFill}
                    disabled={isAILoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isAILoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyse IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Remplir avec IA</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Nom du produit */}
                  <div className="col-span-2">
                    <AIInputWrapper isAIGenerated={aiFilledFields.has('name')}>
                      <FunctionalInput
                        id="name"
                        label="Nom du produit *"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ex: iPhone 15 Pro"
                        status={getFieldStatus('name')}
                        error={validationErrors.name}
                      />
                    </AIInputWrapper>
                  </div>

                  {/* Référence fabricant */}
                  <AIInputWrapper isAIGenerated={aiFilledFields.has('manufacturer_ref')}>
                    <FunctionalInput
                      id="manufacturer_ref"
                      label="Référence fabricant"
                      value={formData.manufacturer_ref || ''}
                      onChange={(e) => handleInputChange('manufacturer_ref', e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="REF-FAB-001"
                      status={getFieldStatus('manufacturer_ref')}
                    />
                  </AIInputWrapper>

                  {/* Référence interne */}
                  <FunctionalInput
                    id="internal_ref"
                    label="Référence interne"
                    value={formData.internal_ref || ''}
                    onChange={(e) => handleInputChange('internal_ref', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="REF-INT-001 (optionnel)"
                    status={getFieldStatus('internal_ref')}
                    error={validationErrors.internal_ref}
                  />

                  {/* Code-barres */}
                  <div className="space-y-2">
                    <Label htmlFor="barcode" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Barcode className="h-4 w-4" />
                      Code-barres (SKU)
                    </Label>
                    <div className="relative">
                      <Input
                        id="barcode"
                        value={formData.barcode || ''}
                        onChange={(e) => handleInputChange('barcode', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="1234567890123"
                        className="pr-10 h-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowScanner(true)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                        title="Scanner le code-barres"
                      >
                        <Camera className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Marque */}
                  <AIInputWrapper isAIGenerated={aiFilledFields.has('brand')}>
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Building2 className="h-4 w-4" />
                        Marque
                      </Label>
                      <Input
                        id="brand"
                        value={formData.brand || ''}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Apple, Samsung, etc."
                        className="h-10"
                      />
                    </div>
                  </AIInputWrapper>

                  {/* Catégorie */}
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="category_id" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Tag className="h-4 w-4" />
                      Catégorie
                    </Label>
                    {isLoadingCategories ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <select
                        id="category_id"
                        value={formData.category_id || ''}
                        onChange={(e) => handleInputChange('category_id', e.target.value)}
                        onKeyDown={handleKeyDown}
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
                    <AIInputWrapper isAIGenerated={aiFilledFields.has('short_description')}>
                      <div className="space-y-2">
                        <Label htmlFor="short_description" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FileText className="h-4 w-4" />
                          Description courte
                        </Label>
                        <textarea
                          id="short_description"
                          value={formData.short_description || ''}
                          onChange={(e) => handleInputChange('short_description', e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Description courte du produit..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </AIInputWrapper>
                  </div>

                  {/* Période de garantie */}
                  <AIInputWrapper isAIGenerated={aiFilledFields.has('warranty_period')}>
                    <div className="space-y-2">
                      <Label htmlFor="warranty_period" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar className="h-4 w-4" />
                        Période de garantie
                      </Label>
                      <Input
                        id="warranty_period"
                        value={formData.warranty_period || ''}
                        onChange={(e) => handleInputChange('warranty_period', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="2 ans, 24 mois, etc."
                        className="h-10"
                      />
                    </div>
                  </AIInputWrapper>
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
                  <div className="space-y-2">
                    <Label htmlFor="purchase_price_htva" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <ArrowDownToLine className="h-4 w-4 text-blue-600" />
                      Prix d'achat HTVA (€)
                    </Label>
                    <Input
                      id="purchase_price_htva"
                      type="number"
                      step="0.01"
                      value={formData.purchase_price_htva || ''}
                      onChange={(e) => handleInputChange('purchase_price_htva', parseFloat(e.target.value))}
                      onKeyDown={handleKeyDown}
                      placeholder="0.00"
                      className="h-10"
                    />
                  </div>

                  {/* Prix de vente HTVA */}
                  <AIInputWrapper isAIGenerated={aiFilledFields.has('selling_price_htva')}>
                    <div className="space-y-2">
                      <Label htmlFor="selling_price_htva" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <ArrowUpFromLine className="h-4 w-4 text-emerald-600" />
                        Prix de vente HTVA (€)
                      </Label>
                      <Input
                        id="selling_price_htva"
                        type="number"
                        step="0.01"
                        value={formData.selling_price_htva || ''}
                        onChange={(e) => handleInputChange('selling_price_htva', parseFloat(e.target.value))}
                        onKeyDown={handleKeyDown}
                        placeholder="0.00"
                        className="h-10"
                      />
                    </div>
                  </AIInputWrapper>
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
            <StockTab 
              product={product!} 
              onStockUpdate={handleStockUpdate}
            />
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
                    onKeyDown={handleKeyDown}
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
                    onKeyDown={handleKeyDown}
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
        {/* Header plein compact */}
        <div className="p-4 h-[100px] flex-shrink-0 border-b bg-white">
          <div className="flex items-center gap-3 h-full">
            {/* Image produit avec hover modifier */}
            {product && (
              <div className="relative group cursor-pointer" onClick={() => setShowImageGallery(!showImageGallery)}>
                <ProductThumbnail 
                  productId={product.id} 
                  size="lg" 
                  className="rounded-lg flex-shrink-0"
                />
                {/* Icône modifier au hover */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Edit className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg" />
                </div>
              </div>
            )}
            
            {/* Infos principales */}
            <div className="flex-1 min-w-0 h-full flex flex-col justify-between">
              {/* Ligne 1: Nom du produit */}
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {product ? product.name : 'Nouveau produit'}
              </h2>
              
              {/* Ligne 2: Référence fabricant */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">
                  {product?.manufacturer_ref || 'Aucune référence'}
                </span>
              </div>
              
              {/* Ligne 3: Stock et Prix - Extensible */}
              <div className="flex items-center gap-4">
                {/* Stock */}
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {(product?.quantity || 0)}
                  </span>
                </div>
                
                {/* Prix de vente */}
                {formData.selling_price_htva && (
                  <div className="flex items-center gap-1">
                    <ArrowUpFromLine className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {formData.selling_price_htva.toFixed(2)}€
                    </span>
                  </div>
                )}
                
                {/* Prix d'achat */}
                {formData.purchase_price_htva && (
                  <div className="flex items-center gap-1">
                    <ArrowDownToLine className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {formData.purchase_price_htva.toFixed(2)}€
                    </span>
                  </div>
                )}
                
                {/* Zone extensible pour autres infos */}
                {/* Exemple: Catégorie */}
                {formData.category_id && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {categories.find(cat => cat.id === formData.category_id)?.name || 'Catégorie'}
                    </span>
                  </div>
                )}
                
                {/* Exemple: Marque */}
                {formData.brand && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {formData.brand}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Boutons d'action dans le header */}
            <div className="flex items-start gap-2">
              {/* Bouton supprimer */}
              {product && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isLoading}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Supprimer ce produit"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              {/* Bouton fermer */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={isLoading}
                className="h-8 w-8"
                title="Fermer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Galerie d'images avec animation */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showImageGallery ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-end mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageGallery(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <ImageUploader
              productId={product?.id}
              images={images}
              onImagesChange={setImages}
            />
          </div>
        </div>

        {/* Onglets */}
        <div className="px-4 border-b">
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            className="border-b-0"
          />
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4">
            {renderTabContent()}
          </div>
        </form>

        {/* Bouton enregistrer flottant - seulement si modifications */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button 
              onClick={handleFormSubmit}
              disabled={isLoading} 
              size="icon"
              className="h-12 w-12 bg-blue-600 hover:bg-blue-700 shadow-lg"
              title={product ? 'Mettre à jour' : 'Ajouter'}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
            </Button>
          </div>
        )}
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
        <BarcodeScanner
          onScanSuccess={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
