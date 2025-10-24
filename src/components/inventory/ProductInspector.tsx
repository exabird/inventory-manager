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
import AILabelWithButton from '@/components/ui/AILabelWithButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Product, Category, TechnicalSpecifications, Brand } from '@/lib/supabase';
import { CategoryService, BrandService } from '@/lib/services';
import Tabs, { TabContent } from '@/components/ui/Tabs';
import ImageUploader from '@/components/inventory/ImageUploaderSquare';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import ProductThumbnail from '@/components/inventory/ProductThumbnail';
import { ProductImage, ProductImageService } from '@/lib/productImageService';
import { ProductDetectionService } from '@/lib/productDetectionService';
import StockTab from '@/components/inventory/StockTab';
import TechnicalSpecsEditor from '@/components/inventory/TechnicalSpecsEditor';
import AIAutoFillButton, { AIFillStep } from '@/components/ui/AIAutoFillButton';
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
  brand: string | null; // Deprecated: Utiliser brand_id
  brand_id: string | null; // 🆕 FK vers brands
  short_description: string | null;
  selling_price_htva: number | null;
  purchase_price_htva: number | null;
  warranty_period: string | null;
  min_stock_required: boolean | null;
  min_stock_quantity: number | null;
  // Description et spécifications techniques
  long_description: string | null;
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
  onSubmit: (data: ProductFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
  onThumbnailChange?: () => void; // 🆕 Notifier le parent quand la miniature change
}

export default function ProductInspector({
  product,
  barcode,
  onSubmit,
  onDelete,
  onClose,
  isLoading = false,
  onThumbnailChange, // 🆕 Callback pour notifier les changements de miniature
}: ProductInspectorProps) {
  // 🆕 Générer un UUID pour les nouveaux produits (sans ID)
  const [productId] = useState<string>(() => {
    if (product?.id) return product.id;
    // Générer un UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  });
  
  const [isNewProduct] = useState(!product?.id); // 🆕 Mode création si pas d'ID
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]); // 🆕 Liste des marques
  const [isLoadingBrands, setIsLoadingBrands] = useState(true); // 🆕 État de chargement
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('favorites');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState<ProductFormData | null>(null);
  const [showImageGallery, setShowImageGallery] = useState(false);
  
  // État pour la progression du fetch IA complet
  const [aiStep, setAiStep] = useState<AIFillStep>('idle');
  const [completeSummary, setCompleteSummary] = useState<{ images: number; metas: number }>();
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
        brand_id: product?.brand_id || null, // 🆕 ID de la marque
        short_description: product?.short_description || '',
        selling_price_htva: product?.selling_price_htva || null,
        purchase_price_htva: product?.purchase_price_htva || null,
        warranty_period: product?.warranty_period || '',
        min_stock_required: product?.min_stock_required || false,
        min_stock_quantity: product?.min_stock_quantity || 0,
    long_description: product?.long_description || '',
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
  
  // États pour le remplissage IA (Fonction 2)
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  const [isAILoading, setIsAILoading] = useState(false);
  const [isAILoadingImages, setIsAILoadingImages] = useState(false);
  const [imagesFeedback, setImagesFeedback] = useState<{ message: string; count: number; size: string } | null>(null);
  const [thumbnailRefresh, setThumbnailRefresh] = useState(0);

  // 🆕 Fonction pour notifier les changements de miniature (local + parent)
  const notifyThumbnailChange = () => {
    setThumbnailRefresh(prev => prev + 1);
    if (onThumbnailChange) {
      onThumbnailChange();
    }
  };
  const [newImageIds, setNewImageIds] = useState<Set<string>>(new Set());

  // 🆕 Initialiser initialFormData au montage avec une copie profonde
  useEffect(() => {
    if (!initialFormData) {
      const deepCopy = JSON.parse(JSON.stringify(formData));
      setInitialFormData(deepCopy);
      console.log('✅ [ProductInspector] initialFormData initialisé');
    }
  }, []);

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

  // 🆕 Charger les marques
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setIsLoadingBrands(true);
        const brandsData = await BrandService.getAll();
        setBrands(brandsData);
        console.log('✅ [ProductInspector] Marques chargées:', brandsData.length);
      } catch (error) {
        console.warn('⚠️ [ProductInspector] Erreur chargement marques:', error);
        setBrands([]);
      } finally {
        setIsLoadingBrands(false);
      }
    };
    loadBrands();
  }, []);

  // 🔄 Polling : Recharger les images depuis la BDD toutes les 2 secondes
  // ⚠️ UNIQUEMENT pendant un fetch IA actif
  useEffect(() => {
    // Ne rien charger si nouveau produit (pas encore créé)
    if (isNewProduct) return;
    
    // Ne recharger que pendant un fetch IA actif
    const isAIActive = aiStep !== 'idle' && aiStep !== 'complete' && aiStep !== 'error';
    if (!isAIActive) {
      return;
    }
    
    const loadProductImages = async () => {
      try {
        const productImages = await ProductImageService.getByProductId(productId);
        
        // Trier les images par date de création (plus récentes en premier)
        const sortedImages = productImages.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA; // Ordre décroissant (plus récent d'abord)
        });
        
        // Ne mettre à jour que si le nombre d'images a changé
        if (sortedImages.length !== images.length) {
          console.log('🔄 [ProductInspector] Mise à jour images:', sortedImages.length);
          setImages(sortedImages);
        }
      } catch (error) {
        console.error('❌ [ProductInspector] Erreur chargement images:', error);
      }
    };
    
    // Charger immédiatement
    loadProductImages();
    
    // Puis toutes les 2 secondes
    const interval = setInterval(loadProductImages, 2000);
    
    return () => clearInterval(interval);
  }, [productId, images.length, aiStep, isNewProduct]);

  // 🔄 Polling : Recharger le produit depuis la BDD toutes les 2 secondes
  // ⚠️ UNIQUEMENT pendant un fetch IA ET si pas de modifications en cours
  useEffect(() => {
    // Ne rien charger si nouveau produit (pas encore créé)
    if (isNewProduct) return;
    
    // Ne pas recharger si l'utilisateur a des modifications non sauvegardées
    if (hasChanges) {
      console.log('⏸️ [ProductInspector] Polling désactivé : modifications en cours');
      return;
    }
    
    // Ne recharger que pendant un fetch IA actif
    const isAIActive = aiStep !== 'idle' && aiStep !== 'complete' && aiStep !== 'error';
    if (!isAIActive) {
      return;
    }
    
    const reloadProduct = async () => {
      try {
        const { ProductService } = await import('@/lib/services');
        const freshProduct = await ProductService.getById(productId);
        
        if (freshProduct) {
          console.log('🔄 [ProductInspector] Mise à jour temps réel:', freshProduct.name);
          const initialData = {
            barcode: freshProduct.barcode || '',
            name: freshProduct.name || '',
            manufacturer: freshProduct.manufacturer || '',
            internal_ref: freshProduct.internal_ref || '',
            quantity: freshProduct.quantity || 0,
            category_id: freshProduct.category_id || '',
            image_url: freshProduct.image_url || '',
            notes: freshProduct.notes || '',
            manufacturer_ref: freshProduct.manufacturer_ref || '',
            brand: freshProduct.brand || '',
            brand_id: freshProduct.brand_id || null,
            short_description: freshProduct.short_description || '',
            selling_price_htva: freshProduct.selling_price_htva || null,
            purchase_price_htva: freshProduct.purchase_price_htva || null,
            warranty_period: freshProduct.warranty_period || '',
            min_stock_required: freshProduct.min_stock_required || false,
            min_stock_quantity: freshProduct.min_stock_quantity || 0,
            long_description: freshProduct.long_description || '',
            technical_specifications: freshProduct.technical_specifications || null,
            metadata: {
              supplier: (freshProduct.metadata as any)?.supplier || '',
              location: (freshProduct.metadata as any)?.location || '',
              weight: (freshProduct.metadata as any)?.weight || null,
              dimensions: (freshProduct.metadata as any)?.dimensions || '',
              expiration_date: (freshProduct.metadata as any)?.expiration_date || '',
              sku: (freshProduct.metadata as any)?.sku || '',
              tags: (freshProduct.metadata as any)?.tags || [],
              color: (freshProduct.metadata as any)?.color || '',
              material: (freshProduct.metadata as any)?.material || '',
              certifications: (freshProduct.metadata as any)?.certifications || '',
              manufacturing_date: (freshProduct.metadata as any)?.manufacturing_date || '',
              warranty_duration: (freshProduct.metadata as any)?.warranty_duration || '',
              stock_date: (freshProduct.metadata as any)?.stock_date || '',
              website: (freshProduct.metadata as any)?.website || '',
              external_links: (freshProduct.metadata as any)?.external_links || '',
              seo_keywords: (freshProduct.metadata as any)?.seo_keywords || '',
              price_history: (freshProduct.metadata as any)?.price_history || [],
              stock_history: (freshProduct.metadata as any)?.stock_history || [],
              internal_notes: (freshProduct.metadata as any)?.internal_notes || '',
            },
          };
          
          // ⚠️ IMPORTANT : Créer deux copies profondes distinctes
          const formDataCopy = JSON.parse(JSON.stringify(initialData));
          const initialDataCopy = JSON.parse(JSON.stringify(initialData));
          setFormData(formDataCopy);
          setInitialFormData(initialDataCopy);
          setHasChanges(false);
        }
      } catch (error) {
        console.error('❌ [ProductInspector] Erreur reload:', error);
      }
    };
    
    // Recharger immédiatement
    reloadProduct();
    
    // Puis toutes les 2 secondes
    const interval = setInterval(reloadProduct, 2000);
    
    return () => clearInterval(interval);
  }, [productId, hasChanges, aiStep, isNewProduct]);

  // Détecter les modifications en temps réel
  useEffect(() => {
    if (initialFormData) {
      const hasModifications = checkForChanges(formData);
      console.log('🔍 [checkForChanges] Détection:', {
        hasModifications,
        formData: JSON.stringify(formData).substring(0, 100),
        initialFormData: JSON.stringify(initialFormData).substring(0, 100)
      });
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
      'category_id', 'image_url', 'notes', 'manufacturer_ref', 'brand', 'brand_id',
      'short_description', 'selling_price_htva', 'purchase_price_htva', 'warranty_period',
      'long_description'
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
    
    // Comparer les spécifications techniques
    if (JSON.stringify(currentData.technical_specifications) !== JSON.stringify(initialFormData.technical_specifications)) {
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
   * 🚀 FONCTION AUTO-FILL COMPLÈTE (Métadonnées + Images)
   * Identique à la fonction de la liste avec progression
   */
  const handleAIAutoFill = async () => {
    // 🆕 Vérifier qu'il y a au moins un nom
    if (!formData.name || formData.name.trim() === '') {
      alert('⚠️ Veuillez saisir au moins un nom de produit pour lancer le fetch IA.');
      return;
    }
    
    try {
      setAiStep('starting');
      console.log('🎨 [AI Auto-Fill Inspector] Début:', formData.name);
      
      // Récupérer les paramètres AI
      const savedSettings = localStorage.getItem('ai_settings');
      let apiKey = null;
      let model = 'claude-sonnet-4-20250514';
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        apiKey = settings.claudeApiKey;
        model = settings.model || model;
      }

      if (!apiKey) {
        alert('⚠️ Clé API Anthropic non configurée. Allez dans Paramètres.');
        throw new Error('API key not configured');
      }

      // 1. Métadonnées
      setAiStep('fetching_metadata');
      console.log('📝 [AI Auto-Fill] Étape 1/2 : Métadonnées...');
      
      const metaResponse = await fetch('/api/ai-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productData: {
            id: productId, // 🆕 UUID généré ou existant
            name: formData.name,
            brand: formData.brand,
            brand_id: formData.brand_id, // 🆕 ID de la marque pour prompt personnalisé
            manufacturer: formData.manufacturer,
            barcode: formData.barcode,
            manufacturer_ref: formData.manufacturer_ref
          },
          apiKey,
          model
        })
      });

      if (!metaResponse.ok) {
        throw new Error('Erreur lors du remplissage des métadonnées');
      }

      const metaData = await metaResponse.json();
      console.log('✅ [AI Auto-Fill] Métadonnées récupérées');

      // 2. Images
      setAiStep('scraping_images');
      console.log('📸 [AI Auto-Fill] Étape 2/2 : Images...');
      
      const imagesResponse = await fetch('/api/ai-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productData: {
            id: productId,
            name: formData.name,
            brand: formData.brand,
            brand_id: formData.brand_id, // 🆕 ID de la marque pour prompt personnalisé
            manufacturer: formData.manufacturer,
            barcode: formData.barcode
          },
          apiKey,
          model,
          targetField: 'images',
          mode: 'images_only'
        })
      });

      if (!imagesResponse.ok) {
        throw new Error('Erreur lors de la récupération des images');
      }

      await imagesResponse.json();
      console.log('✅ [AI Auto-Fill] Images récupérées');

      // 3. Classification
      setAiStep('classifying_images');
      console.log('🎨 [AI Auto-Fill] Classification...');

      // Recharger les images
      let allImages = await ProductImageService.getByProductId(productId);

      // Classifier avec l'IA (toutes les images sans filtre lors du fetch auto)
      if (allImages.length > 0) {
        console.log(`🎨 [AI Auto-Fill] Classification de ${allImages.length} images...`);
        
        const classifyResponse = await fetch('/api/classify-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrls: allImages.map(img => img.url), // ✅ Envoyer URLs uniquement
            productName: formData.name,
            apiKey,
            model,
            filterType: 'all' // Pas de filtre lors du fetch auto, on garde toutes les images
          })
        });

        if (classifyResponse.ok) {
          const classifyData = await classifyResponse.json();
          console.log('✅ [AI Auto-Fill] Classification reçue:', classifyData.analyses?.length, 'analyses');
          
          // Mettre à jour les types (mapper par index)
          if (classifyData.analyses && Array.isArray(classifyData.analyses)) {
            for (const analysis of classifyData.analyses) {
              try {
                const imageIndex = analysis.index;
                const image = allImages[imageIndex];
                
                if (image) {
                  console.log(`🎨 [AI Auto-Fill] Image ${imageIndex}: ${analysis.type} (${analysis.confidence})`);
                  await ProductImageService.update(image.id, {
                    image_type: analysis.type,
                    ai_confidence: analysis.confidence,
                    ai_analysis: analysis.reason
                  });
                }
              } catch (error) {
                console.warn('⚠️ Erreur update image:', error);
              }
            }
          }
          
          // Supprimer les "unwanted"
          const unwantedAnalyses = classifyData.analyses?.filter((a: any) => a.type === 'unwanted') || [];
          console.log(`🗑️ [AI Auto-Fill] Suppression de ${unwantedAnalyses.length} images unwanted`);
          
          for (const analysis of unwantedAnalyses) {
            try {
              const imageIndex = analysis.index;
              const image = allImages[imageIndex];
              
              if (image) {
                await ProductImageService.delete(image.id);
                console.log(`🗑️ [AI Auto-Fill] Image unwanted supprimée: ${imageIndex}`);
              }
            } catch (error) {
              console.warn('⚠️ Erreur suppression image:', error);
            }
          }
        } else {
          console.error('❌ [AI Auto-Fill] Erreur classification:', await classifyResponse.text());
        }
      }

      // Recompter
      allImages = await ProductImageService.getByProductId(productId);
      const totalImagesCount = allImages.length;

      // Featured automatique
      const hasFeatured = allImages.some(img => img.is_featured);
      if (!hasFeatured && allImages.length > 0) {
        const firstProductImage = allImages.find(img => img.image_type === 'product');
        const imageToFeature = firstProductImage || allImages[0];
        await ProductImageService.update(imageToFeature.id, { is_featured: true });
        notifyThumbnailChange();
      }

      // Recharger les images dans l'UI
      const sortedImages = allImages.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setImages(sortedImages);

      // Mettre à jour les métadonnées dans formData
      if (metaData.success && metaData.data) {
        const cleanedData = { ...metaData.data };
        delete cleanedData.category;
        
        const metasCount = Object.keys(cleanedData).filter(key => {
          const value = cleanedData[key as keyof typeof cleanedData];
          return value !== null && value !== '' && value !== undefined;
        }).length;

        // Mettre à jour le formData directement
        setFormData(prev => ({
          ...prev,
          ...cleanedData
        }));

        // Marquer les champs comme remplis par l'IA
        setAiFilledFields(new Set(Object.keys(cleanedData)));

        console.log(`📈 [AI Auto-Fill] Résumé: ${totalImagesCount} images, ${metasCount} metas`);
        setCompleteSummary({ images: totalImagesCount, metas: metasCount });
        setAiStep('complete');
      }
    } catch (error) {
      console.error('❌ [AI Auto-Fill] Erreur:', error);
      setAiStep('error');
      setTimeout(() => setAiStep('idle'), 3000);
    }
  };

  /**
   * 🤖 FONCTION 2 : Remplissage IA Avancé (ANCIEN - Métadonnées uniquement)
   * Appelé manuellement via le bouton IA
   * Utilise Claude pour rechercher et remplir les informations complètes
   */
  const handleAIFill = async () => {
    try {
      console.log('🤖 [Fonction 2] Début remplissage IA');
      setIsAILoading(true);
      
      // Récupérer la clé API et le modèle depuis les paramètres sauvegardés
      const savedSettings = localStorage.getItem('ai_settings');
      let apiKey = null;
      let model = 'claude-sonnet-4-20250514'; // Par défaut
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        apiKey = settings.claudeApiKey;
        model = settings.model || model;
      }
      
      if (!apiKey) {
        alert('⚠️ Clé API Claude non configurée.\n\nAllez dans Paramètres → API Claude pour configurer votre clé API Anthropic.');
        setIsAILoading(false);
        return;
      }
      
      console.log('🔑 [Fonction 2] Clé API récupérée depuis les paramètres');
      console.log('🤖 [Fonction 2] Modèle sélectionné:', model);
      
      // Appeler l'API Claude
      const response = await fetch('/api/ai-fill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productData: {
            ...formData,
            brand_id: formData.brand_id // 🆕 ID de la marque pour prompt personnalisé
          },
          apiKey: apiKey,
          model: model
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'appel à l\'API IA');
      }
      
      const result = await response.json();
      console.log('✅ [Fonction 2] Données IA reçues:', result.data);
      
      // Vérifier si des images ont été uploadées
      if (result.supabaseImages && result.supabaseImages.length > 0) {
        console.log('🖼️ [Fonction 2] Images uploadées dans Supabase:', result.supabaseImages.length);
        alert(`✅ ${result.supabaseImages.length} image(s) récupérée(s) et uploadée(s) dans Supabase !`);
      }
      
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
          updated.long_description = aiData.long_description;
          filledFields.add('long_description');
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
        
        // Remplir les spécifications techniques
        if (aiData.technical_specifications || aiData.specifications) {
          updated.technical_specifications = aiData.technical_specifications || aiData.specifications;
          filledFields.add('technical_specifications');
        }
        
        // Ajouter aussi les spécifications dans les métadonnées pour compatibilité
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

  // Fonction pour récupérer les images avec l'IA
  const handleAIFillImages = async (filterType: 'all' | 'product' | 'lifestyle' = 'all') => {
    try {
      console.log('🖼️ [IA Images] Début récupération images, filtre:', filterType);
      setIsAILoadingImages(true);
      
      // 🆕 Vérifier qu'il y a au moins un nom
      if (!formData.name || formData.name.trim() === '') {
        alert('⚠️ Veuillez saisir au moins un nom de produit');
        return;
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
        alert('⚠️ Clé API Claude non configurée.\n\nAllez dans Paramètres → API Claude pour configurer votre clé API Anthropic.');
        return;
      }
      
      console.log('🔑 [IA Images] Clé API récupérée');
      console.log('🤖 [IA Images] Modèle sélectionné:', model);
      
      // Appeler l'API avec mode full_copy pour récupérer les images
      const response = await fetch('/api/ai-fill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productData: {
            id: productId,
            name: formData.name,
            brand: formData.brand,
            brand_id: formData.brand_id, // 🆕 ID de la marque pour prompt personnalisé
            manufacturer: formData.manufacturer,
            barcode: formData.barcode
          },
          apiKey: apiKey,
          model: model,
          targetField: 'images',
          mode: 'images_only'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [IA Images] Erreur API:', errorData);
        
        // Construire un message d'erreur détaillé
        let errorMessage = errorData.error || 'Erreur lors de l\'appel à l\'API IA';
        if (errorData.debugInfo) {
          const debug = errorData.debugInfo;
          errorMessage += `\n\nÉtape: ${debug.step || 'Inconnue'}`;
          if (debug.details) {
            if (debug.details.urlFound) errorMessage += `\nURL trouvée: ${debug.details.urlFound}`;
            if (debug.details.imagesFound !== undefined) errorMessage += `\nImages trouvées: ${debug.details.imagesFound}`;
            if (debug.details.pageTitle) errorMessage += `\nTitre de la page: ${debug.details.pageTitle}`;
          }
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ [IA Images] Réponse reçue:', result);
      
      // Vérifier si des images ont été uploadées
      if (result.supabaseImages && result.supabaseImages.length > 0) {
        console.log('🖼️ [IA Images] Images uploadées:', result.supabaseImages.length);
        
        // ✅ Les images sont DÉJÀ sauvegardées en BDD par /api/download-images
        // Pas besoin de les sauvegarder à nouveau ici (évite les doublons)
        
        // Recharger toutes les images depuis la BDD
        console.log('🔄 [IA Images] Rechargement des images depuis la BDD...');
        let allImages = await ProductImageService.getByProductId(productId);
        
        // Trier les images par date de création (plus récentes en premier)
        allImages.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        setImages(allImages);
        
        // Classifier les images avec l'IA
        console.log('🎨 [IA Images] Classification des images...');
        try {
          const savedSettings = localStorage.getItem('ai_settings');
          let classifyApiKey = null;
          let classifyModel = 'claude-sonnet-4-20250514';
          
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            classifyApiKey = settings.claudeApiKey;
            classifyModel = settings.model || classifyModel;
          }
          
          if (classifyApiKey) {
            const classifyResponse = await fetch('/api/classify-images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageUrls: result.supabaseImages,
                productName: formData.name,
                productDescription: formData.short_description,
                apiKey: classifyApiKey,
                model: classifyModel,
                filterType: filterType
              })
            });
            
            if (classifyResponse.ok) {
              const classifyData = await classifyResponse.json();
              console.log('✅ [IA Images] Classification terminée');
              
              // Mettre à jour chaque image avec sa classification
              for (let i = 0; i < allImages.length; i++) {
                const analysis = classifyData.analyses?.find((a: any) => a.index === i);
                if (analysis && allImages[i]) {
                  await ProductImageService.update(allImages[i].id, {
                    image_type: analysis.type,
                    ai_confidence: analysis.confidence,
                    ai_analysis: {
                      reason: analysis.reason,
                      matches_product: analysis.matches_product
                    }
                  });
                }
              }
              
              // Supprimer automatiquement les images "unwanted"
              const unwantedImages = allImages.filter((img: ProductImage, i: number) => {
                const analysis = classifyData.analyses?.find((a: any) => a.index === i);
                return analysis?.type === 'unwanted';
              });
              
              if (unwantedImages.length > 0) {
                console.log(`🗑️ [IA Images] Suppression de ${unwantedImages.length} image(s) indésirable(s)`);
                for (const unwantedImage of unwantedImages) {
                  await ProductImageService.delete(unwantedImage.id);
                }
              }
            }
          }
        } catch (classifyError) {
          console.error('⚠️ [IA Images] Erreur classification:', classifyError);
          // Continuer même si la classification échoue
        }
        
        // Recharger après classification
        allImages = await ProductImageService.getByProductId(productId);
        setImages(allImages);
        
        // Définir la première image "product" comme featured si aucune image featured n'existe
        const hasFeatured = allImages.some(img => img.is_featured);
        if (!hasFeatured && allImages.length > 0) {
          // Priorité : première image de type "product", sinon première image
          const firstProductImage = allImages.find(img => img.image_type === 'product');
          const imageToFeature = firstProductImage || allImages[0];
          
          console.log('⭐ [IA Images] Définition de la première image comme featured...');
          await ProductImageService.update(imageToFeature.id, { is_featured: true });
          
          // Recharger pour avoir la featured à jour
          const updatedImages = await ProductImageService.getByProductId(productId);
          setImages(updatedImages);
          
          // Forcer le refresh du thumbnail dans le header
          notifyThumbnailChange();
        }
        
        // Afficher un feedback visuel
        const finalCount = allImages.filter(img => img.image_type !== 'unwanted').length;
        
        setImagesFeedback({
          message: `${finalCount} image(s) récupérée(s) et classée(s)`,
          count: finalCount,
          size: 'N/A'
        });
        
        // Masquer le feedback après 5 secondes
        setTimeout(() => {
          setImagesFeedback(null);
        }, 5000);
      } else {
        // Afficher un message d'erreur détaillé
        setImagesFeedback({
          message: 'Aucune image trouvée',
          count: 0,
          size: 'Vérifiez les logs pour plus de détails'
        });
        setTimeout(() => setImagesFeedback(null), 8000);
      }
      
    } catch (error: any) {
      console.error('❌ [IA Images] Erreur:', error);
      
      // Afficher l'erreur dans l'UI au lieu d'un alert
      setImagesFeedback({
        message: error.message || 'Erreur inconnue',
        count: 0,
        size: 'Voir console (F12) pour détails'
      });
      
      // Masquer après 10 secondes
      setTimeout(() => setImagesFeedback(null), 10000);
    } finally {
      setIsAILoadingImages(false);
    }
  };

  const handleFormSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    console.log('💾 [ProductInspector] Début sauvegarde produit');
    
    if (!validateForm()) {
      console.error('❌ [ProductInspector] Validation échouée');
      return;
    }
    
    console.log('✅ [ProductInspector] Validation OK');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanedData: any = {
      ...formData,
      // 🆕 Inclure l'ID pour les nouveaux produits
      ...(isNewProduct ? { id: productId } : {}),
      category_id: formData.category_id || null,
      manufacturer: formData.manufacturer || null,
      internal_ref: formData.internal_ref || null,
      image_url: formData.image_url || null,
      notes: formData.notes || null,
      manufacturer_ref: formData.manufacturer_ref,
      brand: formData.brand,
      brand_id: formData.brand_id, // 🆕 FK vers brands
      short_description: formData.short_description,
      selling_price_htva: formData.selling_price_htva,
      purchase_price_htva: formData.purchase_price_htva,
      warranty_period: formData.warranty_period,
      min_stock_required: formData.min_stock_required,
      min_stock_quantity: formData.min_stock_quantity,
      long_description: formData.long_description,
      technical_specifications: formData.technical_specifications,
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
      console.log('📤 [ProductInspector] Envoi des données à onSubmit');
      await onSubmit(cleanedData);
      console.log('✅ [ProductInspector] Produit sauvegardé avec succès');
      
      // ✅ Après sauvegarde réussie, mettre à jour initialFormData
      const updatedInitialData = JSON.parse(JSON.stringify(formData));
      setInitialFormData(updatedInitialData);
      setHasChanges(false);
      console.log('✅ [ProductInspector] initialFormData mis à jour après sauvegarde');
    } catch (error) {
      console.error('❌ [ProductInspector] Erreur lors de la soumission:', error);
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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Nom du produit */}
                  <div className="col-span-2">
                    <div className="space-y-2">
                      <AILabelWithButton
                        htmlFor="name"
                        icon={<Package className="h-4 w-4" />}
                        fieldKey="name"
                        fieldLabel="Nom du produit"
                        productName={formData.name}
                        productBarcode={formData.barcode || undefined}
                        isAIGenerated={aiFilledFields.has('name')}
                        onFillComplete={(value) => handleInputChange('name', value)}
                      >
                        Nom du produit *
                      </AILabelWithButton>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ex: iPhone 15 Pro"
                        className="h-10"
                      />
                      {validationErrors.name && (
                        <p className="text-sm text-red-600">{validationErrors.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Référence fabricant */}
                  <div className="space-y-2">
                    <AILabelWithButton
                      htmlFor="manufacturer_ref"
                      icon={<Building2 className="h-4 w-4" />}
                      fieldKey="manufacturer_ref"
                      fieldLabel="Référence fabricant"
                      productName={formData.name}
                      productBarcode={formData.barcode || undefined}
                      isAIGenerated={aiFilledFields.has('manufacturer_ref')}
                      onFillComplete={(value) => handleInputChange('manufacturer_ref', value)}
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
                  <div className="space-y-2">
                    <Label htmlFor="brand_id" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Building2 className="h-4 w-4" />
                      Marque
                      {aiFilledFields.has('brand') && (
                        <Badge variant="outline" className="ml-auto text-[10px] bg-purple-50 text-purple-600 border-purple-200">
                          <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                          IA
                        </Badge>
                      )}
                    </Label>
                    <Select
                      value={formData.brand_id || undefined}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, brand_id: value }));
                      }}
                      disabled={isLoadingBrands}
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder={isLoadingBrands ? "Chargement..." : "Sélectionner une marque"} />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            <div className="flex items-center gap-2">
                              {brand.ai_fetch_prompt && (
                                <Sparkles className="h-3 w-3 text-purple-500 flex-shrink-0" />
                              )}
                              <span className="truncate">{brand.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                    <div className="space-y-2">
                      <AILabelWithButton
                        htmlFor="short_description"
                        icon={<FileText className="h-4 w-4" />}
                        fieldKey="short_description"
                        fieldLabel="Description courte"
                        productName={formData.name}
                        productBarcode={formData.barcode || undefined}
                        isAIGenerated={aiFilledFields.has('short_description')}
                        onFillComplete={(value) => handleInputChange('short_description', value)}
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
                  </div>

                  {/* Description longue */}
                  <div className="col-span-2">
                    <div className="space-y-2">
                      <AILabelWithButton
                        htmlFor="long_description"
                        icon={<FileText className="h-4 w-4" />}
                        fieldKey="long_description"
                        fieldLabel="Description détaillée"
                        productName={formData.name}
                        productBarcode={formData.barcode || undefined}
                        isAIGenerated={aiFilledFields.has('long_description')}
                        onFillComplete={(value) => handleInputChange('long_description', value)}
                      >
                        Description détaillée (HTML)
                      </AILabelWithButton>
                      <RichTextEditor
                        value={formData.long_description || ''}
                        onChange={(value) => handleInputChange('long_description', value)}
                        placeholder="Description détaillée avec mise en forme (titres, listes, gras...)..."
                      />
                    </div>
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
                      onFillComplete={(value) => handleInputChange('warranty_period', value)}
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
                    <AILabelWithButton
                      htmlFor="selling_price_htva"
                      icon={<ArrowUpFromLine className="h-4 w-4 text-emerald-600" />}
                      fieldKey="selling_price_htva"
                      fieldLabel="Prix de vente HTVA"
                      productName={formData.name}
                      productBarcode={formData.barcode || undefined}
                      isAIGenerated={aiFilledFields.has('selling_price_htva')}
                      onFillComplete={(value) => handleInputChange('selling_price_htva', value)}
                    >
                      Prix de vente HTVA (€)
                    </AILabelWithButton>
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
              isAIGenerated={aiFilledFields.has('technical_specifications')}
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
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] lg:w-[600px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
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
                  refreshTrigger={thumbnailRefresh}
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
                {formData.name || (product ? product.name : 'Nouveau produit')}
              </h2>
              
              {/* Ligne 2: Référence fabricant */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">
                  {formData.manufacturer_ref || product?.manufacturer_ref || 'Aucune référence'}
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
              {/* 🚀 Bouton IA Auto-Fill Complet */}
              {product && (
                <AIAutoFillButton
                  step={aiStep}
                  onClick={handleAIAutoFill}
                  completeSummary={completeSummary}
                  variant="inspector"
                  className="flex-shrink-0"
                />
              )}
              
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
              
              {/* Bouton fermer - plus grand et visible */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={isLoading}
                className="h-10 w-10 hover:bg-gray-100"
                title="Fermer (Échap)"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Galerie d'images avec animation */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showImageGallery ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pt-2 pb-1 border-b bg-gray-50">
            <div className="flex justify-end mb-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageGallery(false)}
                className="h-5 w-5 p-0 -mt-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <ImageUploader
              productId={productId} // 🆕 UUID généré ou existant
              images={images}
              onImagesChange={setImages}
              onAIFillImages={handleAIFillImages}
              isAILoadingImages={isAILoadingImages}
              imagesFeedback={imagesFeedback}
              onFeaturedChange={notifyThumbnailChange}
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
