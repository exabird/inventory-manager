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
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FunctionalInput, FunctionalTextarea, FunctionalSelect } from '@/components/ui/FunctionalFields';
import { getFieldStatus } from '@/lib/fieldStatus';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Product, Category, TechnicalSpecifications, supabase } from '@/lib/supabase';
import { CategoryService } from '@/lib/services';
import Tabs, { TabContent } from '@/components/ui/Tabs';
import ImageUploader from '@/components/inventory/ImageUploaderSquare';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import ProductThumbnail from '@/components/inventory/ProductThumbnail';
import { ProductImage } from '@/lib/productImageService';
import { ProductDetectionService } from '@/lib/productDetectionService';
import StockTab from '@/components/inventory/StockTab';
import TechnicalSpecsEditor from '@/components/inventory/TechnicalSpecsEditor';
import UnifiedAIFetchButton, { AIFetchMode, AIFetchProgress } from './UnifiedAIFetchButton';
import AILabelWithButton from '@/components/ui/AILabelWithButton';
import BrandSelector from './BrandSelector';
import CategorySelector from './CategorySelector';
import RichTextEditor from '@/components/ui/RichTextEditor';
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
  // Descriptions
  long_description: string | null;
  // Spécifications techniques
  technical_specifications: TechnicalSpecifications | null;
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
  isOpen: boolean;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
  onThumbnailChange?: () => void;
}

export default function ProductInspector({
  product,
  barcode,
  isOpen,
  onSubmit,
  onDelete,
  onClose,
  isLoading = false,
  onThumbnailChange,
}: ProductInspectorProps) {
  // Condition pour afficher l'inspecteur
  if (!isOpen) return null;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState<ProductFormData | null>(null);
  const [showImageGallery, setShowImageGallery] = useState(false);
  
  // États pour le bouton IA
  const [aiProgress, setAiProgress] = useState<AIFetchProgress>({ mode: 'metas', step: 'idle', message: '' });
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  const [isAILoading, setIsAILoading] = useState(false);
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
        long_description: product?.long_description || '',
        selling_price_htva: product?.selling_price_htva || null,
        purchase_price_htva: product?.purchase_price_htva || null,
        warranty_period: product?.warranty_period || '',
        min_stock_required: product?.min_stock_required || false,
        min_stock_quantity: product?.min_stock_quantity || 0,
    technical_specifications: product?.technical_specifications || null,
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
        long_description: product.long_description || '',
        selling_price_htva: product.selling_price_htva || null,
        purchase_price_htva: product.purchase_price_htva || null,
        warranty_period: product.warranty_period || '',
        min_stock_required: product.min_stock_required || false,
        min_stock_quantity: product.min_stock_quantity || 0,
        technical_specifications: product.technical_specifications || null,
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

  // Gestion du remplissage IA pour un champ individuel
  const handleAIFieldFill = (fieldKey: string) => (value: any) => {
    console.log(`🌟 [handleAIFieldFill] Remplissage du champ ${fieldKey}:`, value);
    
    // Marquer le champ comme rempli par IA
    setAiFilledFields(prev => new Set(prev).add(fieldKey));
    
    // Mettre à jour le champ dans formData
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
    
    setHasChanges(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // ✅ Seul le nom est obligatoire
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

  // Fonction de gestion du fetch IA unifié
  const handleUnifiedAIFetch = async (mode: AIFetchMode) => {
    try {
      console.log('🤖 [UnifiedAIFetch] Début fetch IA en mode:', mode);
      setIsAILoading(true);
      
      // Vérifier qu'il y a au moins un nom
      if (!formData.name || formData.name.trim() === '') {
        throw new Error('Veuillez saisir au moins un nom de produit');
      }
      
      // Récupérer la clé API et le modèle depuis les paramètres sauvegardés
      const savedSettings = localStorage.getItem('ai_settings');
      let apiKey = null;
      let model = 'claude-sonnet-4-20250514';
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        apiKey = settings.claudeApiKey;
        model = settings.model || model;
      }
      
      if (!apiKey) {
        alert('⚠️ Clé API Anthropic non configurée. Allez dans Paramètres pour la configurer.');
        setAiProgress({ mode, step: 'error', message: 'Clé API non configurée' });
        setIsAILoading(false);
        return;
      }
      
      console.log('🔑 [UnifiedAIFetch] Clé API récupérée depuis les paramètres');
      
      // ============================================
      // 1. REMPLISSAGE MÉTADONNÉES (si mode metas ou all)
      // ============================================
      if (mode === 'metas' || mode === 'all') {
        setAiProgress(prev => ({ ...prev, mode, step: 'fetching_metas', message: 'Recherche des informations...', metasCount: 0, imagesCount: 0 }));
        console.log('📝 [UnifiedAIFetch] Étape 1 : Remplissage métadonnées...');
        
        const metaResponse = await fetch('/api/ai-fill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productData: {
              id: product?.id,
              name: formData.name,
              brand: formData.brand,
              brand_id: (formData as any).brand_id,
              manufacturer: formData.manufacturer,
              barcode: formData.barcode,
              manufacturer_ref: formData.manufacturer_ref
            },
            apiKey,
            model
          })
        });

        if (!metaResponse.ok) {
          const errorData = await metaResponse.json();
          throw new Error(errorData.error || 'Erreur lors du remplissage des métadonnées');
        }

        const metaData = await metaResponse.json();
        console.log('✅ [UnifiedAIFetch] Métadonnées récupérées:', metaData.data);
        
        // Marquer fetching_metas comme complété
        setAiProgress(prev => ({ ...prev, completedSteps: [...(prev.completedSteps || []), 'fetching_metas'] }));
        
        // Mettre à jour les données du formulaire avec les données IA
        if (metaData.success && metaData.data) {
          const cleanedData = { ...metaData.data };
          delete cleanedData.category; // Ne pas inclure category
          
          // Filtrer pour ne garder QUE les champs vides
          const fieldsToUpdate: Partial<ProductFormData> = {};
          let metasCount = 0;

          // Gérer la marque spécialement (brand_id)
          if (cleanedData.brand && !formData.brand) {
            const brandName = cleanedData.brand;
            console.log('🏷️ [UnifiedAIFetch] Marque trouvée par IA:', brandName);
            
            // Chercher ou créer la marque dans la DB
            try {
              const { data: existingBrand } = await supabase
                .from('brands')
                .select('id, name')
                .ilike('name', brandName)
                .single();

              if (existingBrand) {
                // Marque existe déjà
                console.log('✅ [UnifiedAIFetch] Marque existante:', existingBrand.name);
                (fieldsToUpdate as any).brand_id = existingBrand.id;
                fieldsToUpdate.brand = existingBrand.name;
                metasCount++;
              } else {
                // Créer nouvelle marque
                console.log('➕ [UnifiedAIFetch] Création nouvelle marque:', brandName);
                const { data: newBrand, error } = await supabase
                  .from('brands')
                  .insert([{ name: brandName }])
                  .select('id, name')
                  .single();

                if (!error && newBrand) {
                  console.log('✅ [UnifiedAIFetch] Marque créée:', newBrand.name);
                  (fieldsToUpdate as any).brand_id = newBrand.id;
                  fieldsToUpdate.brand = newBrand.name;
                  metasCount++;
                } else {
                  console.error('❌ [UnifiedAIFetch] Erreur création marque:', error);
                }
              }
            } catch (error) {
              console.error('❌ [UnifiedAIFetch] Erreur recherche marque:', error);
            }
            
            delete cleanedData.brand; // Retirer brand des cleanedData pour éviter duplication
          }

          // Traiter les autres champs
          Object.entries(cleanedData).forEach(([key, value]) => {
            const currentValue = formData[key as keyof ProductFormData];
            if ((!currentValue || currentValue === '') && value) {
              fieldsToUpdate[key as keyof ProductFormData] = value as any;
              metasCount++;
            }
          });

          if (Object.keys(fieldsToUpdate).length > 0) {
            setFormData(prev => ({ ...prev, ...fieldsToUpdate }));
            setAiProgress(prev => ({ ...prev, metasCount }));
            setHasChanges(true);
            console.log(`✅ [UnifiedAIFetch] ${metasCount} champ(s) rempli(s)`);
          } else {
            console.log('ℹ️ [UnifiedAIFetch] Aucun champ vide à remplir');
          }
        }
      }

      // ============================================
      // 2. RÉCUPÉRATION IMAGES (si mode images ou all)
      // ============================================
      if (mode === 'images' || mode === 'all') {
        // Étape 1 : Recherche URL
        setAiProgress(prev => ({ ...prev, mode, step: 'finding_url', message: 'Recherche URL du produit...', completedSteps: mode === 'all' ? ['fetching_metas'] : [] }));
        console.log('📸 [UnifiedAIFetch] Étape 2 : Récupération images...');

        // Simuler les transitions d'étapes pour meilleure UX
        // L'API /api/ai-fill (images_only) fait tout en interne
        await new Promise(resolve => setTimeout(resolve, 500)); // Afficher "Recherche URL"
        
        setAiProgress(prev => ({ ...prev, step: 'scraping_page', completedSteps: [...(prev.completedSteps || []), 'finding_url'] }));
        await new Promise(resolve => setTimeout(resolve, 300)); // Afficher "Scraping"
        
        setAiProgress(prev => ({ ...prev, step: 'downloading_images', completedSteps: [...(prev.completedSteps || []), 'scraping_page'] }));
        
        const imagesResponse = await fetch('/api/ai-fill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productData: {
              id: product?.id,
              name: formData.name,
              brand: formData.brand,
              manufacturer: formData.manufacturer,
              barcode: formData.barcode
            },
            images_only: true,
            apiKey,
            model
          })
        });

        if (!imagesResponse.ok) {
          const errorData = await imagesResponse.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des images');
        }

        const imagesData = await imagesResponse.json();
        console.log('✅ [UnifiedAIFetch] Images récupérées:', imagesData.supabaseImages?.length || 0);
        
        // Marquer downloading_images comme complété
        setAiProgress(prev => ({ ...prev, completedSteps: [...(prev.completedSteps || []), 'downloading_images'] }));
        
        // Classifier les images si nécessaire
        if (imagesData.supabaseImages && imagesData.supabaseImages.length > 0 && product?.id) {
          // Recharger les images depuis la BDD
          const { ProductImageService } = await import('@/lib/productImageService');
          let allImages = await ProductImageService.getByProductId(product.id);
          
          if (allImages.length > 0) {
            setAiProgress(prev => ({ ...prev, step: 'classifying_images', completedSteps: [...(prev.completedSteps || []), 'downloading_images'] }));
            console.log('🎨 [UnifiedAIFetch] Classification de', allImages.length, 'images...');
            
            const classifyResponse = await fetch('/api/classify-images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageUrls: allImages.map(img => img.url),
                productName: formData.name,
                apiKey,
                model,
                filterType: 'all'
              })
            });

            if (classifyResponse.ok) {
              const classifyData = await classifyResponse.json();
              console.log('✅ [UnifiedAIFetch] Classification terminée');

              // Supprimer les images "unwanted"
              for (const analysis of classifyData.analyses || []) {
                if (analysis.type === 'unwanted' && allImages[analysis.index]) {
                  await ProductImageService.delete(allImages[analysis.index].id);
                  console.log(`🗑️ [UnifiedAIFetch] Image unwanted supprimée: ${analysis.index}`);
                }
              }
            }
          }
          
          // Recompter après classification
          allImages = await ProductImageService.getByProductId(product.id);
          setAiProgress(prev => ({ ...prev, imagesCount: allImages.length }));
          
          // Configurer l'image principale si nécessaire
          setAiProgress(prev => ({ ...prev, step: 'setting_featured', completedSteps: [...(prev.completedSteps || []), 'classifying_images'] }));
          const hasFeatured = allImages.some(img => img.is_featured);
          if (!hasFeatured && allImages.length > 0) {
            const firstProductImage = allImages.find(img => img.image_type === 'product');
            const imageToFeature = firstProductImage || allImages[0];
            await ProductImageService.update(imageToFeature.id, { is_featured: true });
            
            if (onThumbnailChange) {
              onThumbnailChange();
            }
          }
          
          console.log(`✅ [UnifiedAIFetch] ${allImages.length} image(s) traitée(s)`);
        }
      }

      setAiProgress(prev => ({ 
        ...prev, 
        step: 'complete', 
        message: 'Terminé !'
      }));
      console.log('✅ [UnifiedAIFetch] Fetch IA terminé avec succès');
      
    } catch (error: any) {
      console.error('❌ [UnifiedAIFetch] Erreur fetch IA:', error);
      setAiProgress(prev => ({ ...prev, step: 'error', message: error.message || 'Erreur lors du fetch IA' }));
      alert(`❌ Erreur lors du fetch IA: ${error.message}`);
    } finally {
      setIsAILoading(false);
      // Ne PAS réinitialiser pour garder le résumé visible
      // L'utilisateur peut toujours hover pour voir le dernier résultat
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
                      onKeyDown={handleKeyDown}
                      placeholder="Ex: iPhone 15 Pro"
                      status={getFieldStatus('name')}
                      error={validationErrors.name}
                    />
                  </div>

                  {/* Référence fabricant */}
                  <div className="space-y-2">
                    <AILabelWithButton
                      htmlFor="manufacturer_ref"
                      fieldKey="manufacturer_ref"
                      fieldLabel="Référence fabricant"
                      productName={formData.name}
                      productBarcode={formData.barcode || undefined}
                      isAIGenerated={aiFilledFields.has('manufacturer_ref')}
                      onFillComplete={handleAIFieldFill('manufacturer_ref')}
                    >
                      Référence fabricant
                    </AILabelWithButton>
                    <Input
                      id="manufacturer_ref"
                      value={formData.manufacturer_ref || ''}
                      onChange={(e) => handleInputChange('manufacturer_ref', e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="REF-FAB-001"
                      className="h-10"
                    />
                  </div>

                  {/* Référence interne */}
                  <FunctionalInput
                    id="internal_ref"
                    label="Référence interne"
                    value={formData.internal_ref || ''}
                    onChange={(e) => handleInputChange('internal_ref', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="REF-INT-001"
                    status={getFieldStatus('internal_ref')}
                  />

                  {/* Code-barres */}
                  <div className="space-y-2">
                    <AILabelWithButton
                      htmlFor="barcode"
                      icon={<Barcode className="h-4 w-4" />}
                      fieldKey="barcode"
                      fieldLabel="Code-barres (EAN)"
                      productName={formData.name}
                      isAIGenerated={aiFilledFields.has('barcode')}
                      onFillComplete={handleAIFieldFill('barcode')}
                    >
                      Code-barres (SKU)
                    </AILabelWithButton>
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
            <div className="space-y-2">
                    <AILabelWithButton
                      htmlFor="brand"
                      icon={<Building2 className="h-4 w-4" />}
                      fieldKey="brand"
                      fieldLabel="Marque"
                      productName={formData.name}
                      productBarcode={formData.barcode || undefined}
                      isAIGenerated={aiFilledFields.has('brand')}
                      onFillComplete={(value: string) => {
                        handleAIFieldFill('brand')(value);
                      }}
                    >
                      Marque
                    </AILabelWithButton>
              <BrandSelector
                      value={(formData as any).brand_id || null}
                      brandName={formData.brand || null}
                      onChange={(brandId: string | null, brandName: string) => {
                        setFormData(prev => ({
                          ...prev,
                          brand: brandName,
                          brand_id: brandId
                        } as any));
                        setHasChanges(true);
                      }}
                      onKeyDown={handleKeyDown}
              />
            </div>

                  {/* Catégorie */}
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="category_id" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Tag className="h-4 w-4" />
                      Catégorie
                    </Label>
                    <CategorySelector
                      value={formData.category_id || null}
                      onChange={(categoryId: string | null, categoryName: string) => {
                        setFormData(prev => ({
                          ...prev,
                          category_id: categoryId
                        }));
                        setHasChanges(true);
                      }}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  {/* Description courte */}
                  <div className="col-span-2 space-y-2">
                    <AILabelWithButton
                      htmlFor="short_description"
                      icon={<FileText className="h-4 w-4" />}
                      fieldKey="short_description"
                      fieldLabel="Description courte"
                      productName={formData.name}
                      productBarcode={formData.barcode || undefined}
                      isAIGenerated={aiFilledFields.has('short_description')}
                      onFillComplete={handleAIFieldFill('short_description')}
                    >
                      Description courte
                    </AILabelWithButton>
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

                  {/* Description longue */}
                  <div className="col-span-2 space-y-2">
                    <AILabelWithButton
                      htmlFor="long_description"
                      icon={<FileText className="h-4 w-4" />}
                      fieldKey="long_description"
                      fieldLabel="Description longue (WYSIWYG)"
                      productName={formData.name}
                      productBarcode={formData.barcode || undefined}
                      isAIGenerated={aiFilledFields.has('long_description')}
                      onFillComplete={handleAIFieldFill('long_description')}
                    >
                      Description longue (WYSIWYG)
                    </AILabelWithButton>
                    <RichTextEditor
                      value={formData.long_description || ''}
                      onChange={(value) => handleInputChange('long_description', value)}
                      placeholder="Description détaillée du produit avec mise en forme..."
                    />
                  </div>

                  {/* Période de garantie */}
            <div className="space-y-2">
                    <AILabelWithButton
                      htmlFor="warranty_period"
                      icon={<Calendar className="h-4 w-4" />}
                      fieldKey="warranty_period"
                      fieldLabel="Période de garantie"
                      productName={formData.name}
                      productBarcode={formData.barcode || undefined}
                      isAIGenerated={aiFilledFields.has('warranty_period')}
                      onFillComplete={handleAIFieldFill('warranty_period')}
                    >
                      Période de garantie
                    </AILabelWithButton>
              <Input
                      id="warranty_period"
                      value={formData.warranty_period || ''}
                      onChange={(e) => handleInputChange('warranty_period', e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="2 ans, 24 mois, etc."
                      className="h-10"
              />
            </div>
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
            <TechnicalSpecsEditor
              value={formData.technical_specifications}
              onChange={(specs) => setFormData(prev => ({ ...prev, technical_specifications: specs }))}
              isAIGenerated={false}
              productName={formData.name}
              productBarcode={formData.barcode || undefined}
            />
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
              {/* 🚀 Bouton IA Unifié */}
              <UnifiedAIFetchButton
                onFetch={handleUnifiedAIFetch}
                progress={aiProgress}
                className="flex-shrink-0"
              />
              
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
