'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Minus, 
  Edit3, 
  Package, 
  Clock, 
  AlertTriangle,
  History,
  Settings,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Truck,
  User,
  Wrench,
  ShoppingCart,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Zap
} from 'lucide-react';
import { StockService, StockOperation, StockReason } from '@/lib/stockService';
import { Product, supabase } from '@/lib/supabase';

interface StockTabProps {
  product: Product;
  onStockUpdate: (newQuantity: number) => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function StockTab({ product, onStockUpdate }: StockTabProps) {
  const [currentQuantity, setCurrentQuantity] = useState<number>(product.quantity || 0);
  const [minStockRequired, setMinStockRequired] = useState<boolean>(product.min_stock_required || false);
  const [minStockQuantity, setMinStockQuantity] = useState<number>(product.min_stock_quantity || 0);
  const [operations, setOperations] = useState<StockOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // États du wizard
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedOperation, setSelectedOperation] = useState<'add' | 'remove' | 'set' | null>(null);
  const [isLoadingReasons, setIsLoadingReasons] = useState(false);
  
  // États des formulaires
  const [operationQuantity, setOperationQuantity] = useState<number>(0);
  const [operationReason, setOperationReason] = useState<string>('');
  const [operationNotes, setOperationNotes] = useState<string>('');
  const [operationReasons, setOperationReasons] = useState<StockReason[]>([]);
  const [isSubmittingOperation, setIsSubmittingOperation] = useState(false);
  const [showNotesField, setShowNotesField] = useState<boolean>(false);

  const wizardSteps: WizardStep[] = [
    {
      id: 'choose-action',
      title: 'Que voulez-vous faire ?',
      description: 'Sélectionnez le type d\'opération que vous souhaitez effectuer',
      icon: <Target className="h-8 w-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'choose-reason',
      title: 'Pourquoi cette opération ?',
      description: 'Choisissez la raison qui correspond le mieux à votre situation',
      icon: <AlertCircle className="h-8 w-8" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'enter-details',
      title: 'Détails de l\'opération',
      description: 'Entrez la quantité et ajoutez des notes si nécessaire',
      icon: <Edit3 className="h-8 w-8" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'confirm',
      title: 'Confirmer l\'opération',
      description: 'Vérifiez les détails avant de confirmer',
      icon: <CheckCircle className="h-8 w-8" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const operationOptions = [
    {
      id: 'add',
      title: 'Ajouter du stock',
      description: 'J\'ai reçu de nouveaux produits',
      icon: <Plus className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100'
    },
    {
      id: 'remove',
      title: 'Retirer du stock',
      description: 'J\'ai utilisé ou vendu des produits',
      icon: <Minus className="h-6 w-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      hoverColor: 'hover:bg-red-100'
    },
    {
      id: 'set',
      title: 'Corriger le stock',
      description: 'Je veux définir la quantité exacte',
      icon: <Target className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100'
    }
  ];

  const reasonIcons: Record<string, React.ReactNode> = {
    'reception_commande': <Truck className="h-4 w-4" />,
    'retour_client': <User className="h-4 w-4" />,
    'inventaire_correction_add': <CheckCircle className="h-4 w-4" />,
    'reparation_terminee': <Wrench className="h-4 w-4" />,
    'stock_promotionnel': <Zap className="h-4 w-4" />,
    'intervention_client': <User className="h-4 w-4" />,
    'vente_directe': <ShoppingCart className="h-4 w-4" />,
    'casse_defaut': <AlertCircle className="h-4 w-4" />,
    'expedition': <Truck className="h-4 w-4" />,
    'reparation_envoi': <Wrench className="h-4 w-4" />,
    'usage_interne': <Settings className="h-4 w-4" />,
    'inventaire_correction_remove': <CheckCircle className="h-4 w-4" />,
    'erreur_comptage': <AlertCircle className="h-4 w-4" />,
    'reconciliation': <TrendingUp className="h-4 w-4" />,
    'transfert': <ArrowRight className="h-4 w-4" />,
    'inventaire_complet': <CheckCircle className="h-4 w-4" />,
    'initialisation': <Target className="h-4 w-4" />
  };

  useEffect(() => {
    loadOperations();
    setCurrentQuantity(product.quantity || 0);
    setMinStockRequired(product.min_stock_required || false);
    setMinStockQuantity(product.min_stock_quantity || 0);
    
    // Test direct du service au chargement
    const testService = async () => {
      try {
        console.log('🧪 Test direct du StockService au chargement');
        const testReasons = await StockService.getReasons('add');
        console.log('✅ Test réussi - Raisons add:', testReasons?.length || 0);
      } catch (error) {
        console.error('❌ Test échoué:', error);
      }
    };
    testService();
  }, [product.id]);

  const loadOperations = async () => {
    try {
      setIsLoading(true);
      const stockOperations = await StockService.getOperationsByProduct(product.id);
      setOperations(stockOperations);
    } catch (error) {
      console.error('Erreur lors du chargement des opérations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReasons = async (operationType: string) => {
    try {
      setIsLoadingReasons(true);
      setOperationReasons([]); // Réinitialiser d'abord
      console.log('🔄 Début du chargement des raisons pour:', operationType);
      
      const reasons = await StockService.getReasons(operationType);
      console.log('✅ Raisons chargées:', reasons);
      
      if (reasons && reasons.length > 0) {
        setOperationReasons(reasons);
        console.log('✅ Raisons définies dans l\'état:', reasons.length);
      } else {
        console.warn('⚠️ Aucune raison trouvée pour:', operationType);
        setOperationReasons([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des raisons:', error);
      setOperationReasons([]);
      throw error; // Re-lancer l'erreur pour que nextStep puisse la gérer
    } finally {
      setIsLoadingReasons(false);
    }
  };

  const handleMinStockUpdate = async () => {
    try {
      await StockService.updateMinStockSettings(product.id, minStockRequired, minStockQuantity);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
    }
  };

  const startWizard = () => {
    setShowWizard(true);
    setWizardStep(0);
    setSelectedOperation(null);
    setOperationQuantity(0);
    setOperationReason('');
    setOperationNotes('');
  };

  const prevStep = () => {
    setWizardStep(prev => prev - 1);
  };

  const closeWizard = () => {
    setShowWizard(false);
    setWizardStep(0);
    setSelectedOperation(null);
    setOperationQuantity(0);
    setOperationReason('');
    setOperationNotes('');
    setIsLoadingReasons(false);
    setOperationReasons([]);
    setShowNotesField(false);
  };

  const handleOperationSubmit = async () => {
    if (!operationReason || operationQuantity <= 0 || !selectedOperation) return;

    setIsSubmittingOperation(true);
    try {
      console.log('🔄 Opération de stock:', { 
        operationType: selectedOperation, 
        quantity: operationQuantity, 
        reason: operationReason, 
        productId: product.id 
      });
      
      switch (selectedOperation) {
        case 'add':
          await StockService.addStock(product.id, operationQuantity, operationReason, operationNotes);
          console.log('✅ Stock ajouté avec succès');
          break;
        case 'remove':
          await StockService.removeStock(product.id, operationQuantity, operationReason, operationNotes);
          console.log('✅ Stock retiré avec succès');
          break;
        case 'set':
          await StockService.updateQuantity(product.id, operationQuantity, operationReason, operationNotes);
          console.log('✅ Stock défini avec succès');
          break;
      }
      
      // Recharger les données
      await loadOperations();
      
      // Récupérer la quantité actuelle du produit depuis la base de données
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', product.id)
        .single();
      
      if (!error && updatedProduct) {
        const newQuantity = updatedProduct.quantity || 0;
        setCurrentQuantity(newQuantity);
        onStockUpdate(newQuantity);
      }
      
      // Fermer le wizard
      closeWizard();
      
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'opération:', error);
      const errorMessage = error?.message || 'Erreur lors de l\'opération de stock';
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsSubmittingOperation(false);
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'add': return <Plus className="h-3 w-3 text-green-600" />;
      case 'remove': return <Minus className="h-3 w-3 text-red-600" />;
      case 'set': return <Edit3 className="h-3 w-3 text-blue-600" />;
      default: return <Package className="h-3 w-3 text-gray-600" />;
    }
  };

  const getOperationColor = (type: string) => {
    switch (type) {
      case 'add': return 'bg-green-100 text-green-800';
      case 'remove': return 'bg-red-100 text-red-800';
      case 'set': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isStockLow = minStockRequired && currentQuantity <= minStockQuantity;

  const renderWizardStep = () => {
    const currentStepData = wizardSteps[wizardStep];
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 md:p-4">
        <div className="bg-white w-full h-full md:rounded-lg md:shadow-xl md:max-w-2xl md:w-full md:max-h-[90vh] md:h-auto overflow-y-auto">
          {/* Header du wizard */}
          <div className={`p-6 ${currentStepData.bgColor} md:rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={currentStepData.color}>
                  {currentStepData.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{currentStepData.title}</h2>
                  <p className="text-sm text-gray-600">{currentStepData.description}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeWizard}
                className="h-10 w-10 p-0 md:h-8 md:w-8"
              >
                <X className="h-6 w-6 md:h-4 md:w-4" />
              </Button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
                {wizardSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 rounded-full ${
                      index <= wizardStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Étape {wizardStep + 1} sur {wizardSteps.length}
              </p>
            </div>
          </div>

          {/* Contenu du wizard */}
          <div className="p-6">
            {wizardStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Choisissez votre action :</h3>
                <div className="grid gap-3">
                  {operationOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={async () => {
                        setSelectedOperation(option.id as 'add' | 'remove' | 'set');
                        // Charger les raisons immédiatement
                        try {
                          await loadReasons(option.id as 'add' | 'remove' | 'set');
                          setWizardStep(1); // Passer à l'étape suivante seulement après chargement
                        } catch (error) {
                          console.error('❌ Erreur lors du chargement des raisons:', error);
                        }
                      }}
                      className={`p-4 md:p-4 rounded-lg border-2 ${option.borderColor} ${option.bgColor} ${option.hoverColor} transition-colors text-left`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${option.color} flex-shrink-0`}>
                          {option.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{option.title}</h4>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pourquoi cette opération ?</h3>
                {isLoadingReasons ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-gray-600">Chargement des raisons...</p>
                  </div>
                ) : operationReasons.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">Aucune raison disponible</p>
                    <p className="text-sm text-gray-400 mt-1">Veuillez réessayer</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {operationReasons.map((reason) => (
                      <button
                        key={reason.id}
                        onClick={() => {
                          setOperationReason(reason.reason_code);
                          setOperationQuantity(1); // Valeur par défaut à 1
                          setWizardStep(2); // Passer directement à l'étape 3 (détails)
                        }}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-gray-600 flex-shrink-0">
                            {reasonIcons[reason.reason_code] || <AlertCircle className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900">{reason.reason_label}</h4>
                            {reason.description && (
                              <p className="text-sm text-gray-600">{reason.description}</p>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-6">
                {/* Titre simple */}
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Quantité</h3>
                  <p className="text-sm text-gray-600">Entrez la quantité et ajoutez des notes si nécessaire</p>
                </div>

                {/* Interface de saisie de quantité */}
                <div className="flex flex-col items-center space-y-8">
                  {/* Zone principale +/- et quantité */}
                  <div className="flex items-center justify-center gap-2 w-full">
                    {/* Bouton - (gris) */}
                    <Button
                      onClick={() => {
                        const newValue = Math.max(1, operationQuantity - 1);
                        setOperationQuantity(newValue);
                      }}
                      disabled={operationQuantity <= 1}
                      variant="secondary"
                      size="lg"
                      className="h-24 w-24 rounded-l-full rounded-r-lg"
                    >
                      <Minus className="h-12 w-12" />
                    </Button>
                    
                    {/* Zone de saisie centrale */}
                    <div className="relative flex-shrink-0">
                      <Input
                        id="quantity-input"
                        type="number"
                        min="1"
                        max="999"
                        value={operationQuantity || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          if (value <= 999) {
                            setOperationQuantity(value);
                          }
                        }}
                        onFocus={(e) => {
                          // Empêcher la sélection bleue et les flèches
                          e.target.style.caretColor = 'transparent';
                          e.target.style.userSelect = 'none';
                          // Réinitialiser à vide pour permettre la saisie directe
                          e.target.value = '';
                          setTimeout(() => e.target.select(), 50);
                        }}
                        onBlur={(e) => {
                          if (!e.target.value || parseInt(e.target.value) < 1) {
                            setOperationQuantity(1);
                          }
                        }}
                        onKeyDown={(e) => {
                          // Empêcher les flèches du clavier
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                          }
                        }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="text-6xl font-bold text-center border-none bg-transparent px-4 py-0 w-[120px] h-24 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        style={{
                          caretColor: 'transparent',
                          userSelect: 'none'
                        }}
                      />
                    </div>
                    
                    {/* Bouton + */}
                    <Button
                      onClick={() => {
                        const newValue = operationQuantity + 1;
                        if (newValue <= 999) {
                          setOperationQuantity(newValue);
                        }
                      }}
                      disabled={operationQuantity >= 999}
                      variant="default"
                      size="lg"
                      className="h-24 w-24 rounded-r-full rounded-l-lg"
                    >
                      <Plus className="h-12 w-12" />
                    </Button>
                  </div>
                </div>

                {/* Section Notes - Plus discrète */}
                <div className="space-y-3">
                  {!showNotesField ? (
                    <Button
                      onClick={() => setShowNotesField(true)}
                      variant="ghost"
                      size="sm"
                      className="w-full text-gray-500 hover:text-black hover:bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="text-sm">Ajouter une note</span>
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                          Notes (optionnel)
                        </Label>
                        <Button
                          onClick={() => {
                            setShowNotesField(false);
                            setOperationNotes('');
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-black hover:bg-transparent"
                        >
                          Supprimer
                        </Button>
                      </div>
                      <Textarea
                        id="notes"
                        value={operationNotes}
                        onChange={(e) => setOperationNotes(e.target.value)}
                        placeholder="Ajoutez des détails supplémentaires..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                {/* Bouton continuer */}
                {operationQuantity > 0 && (
                  <Button
                    onClick={() => setWizardStep(3)}
                    variant="default"
                    size="lg"
                    className="w-full h-16 text-xl font-bold"
                  >
                    <span className="text-lg">Continuer</span>
                    <ArrowRight className="h-6 w-6 ml-2" />
                  </Button>
                )}
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer l'opération</h3>
                
                {/* Résumé de l'opération */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type d'opération :</span>
                      <span className="text-sm font-medium">
                        {selectedOperation === 'add' && 'Ajouter du stock'}
                        {selectedOperation === 'remove' && 'Retirer du stock'}
                        {selectedOperation === 'set' && 'Définir le stock'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Quantité :</span>
                      <span className="text-sm font-medium">{operationQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Raison :</span>
                      <span className="text-sm font-medium">
                        {operationReasons.find(r => r.reason_code === operationReason)?.reason_label}
                      </span>
                    </div>
                    {operationNotes && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Notes :</span>
                        <span className="text-sm font-medium">{operationNotes}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock actuel :</span>
                      <span className="text-sm font-medium">{currentQuantity} unités</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nouveau stock :</span>
                      <span className="text-sm font-medium">
                        {selectedOperation === 'add' && `${currentQuantity + operationQuantity} unités`}
                        {selectedOperation === 'remove' && `${currentQuantity - operationQuantity} unités`}
                        {selectedOperation === 'set' && `${operationQuantity} unités`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6 gap-4">
              {wizardStep === 0 && (
                <div className="flex justify-center w-full">
                  <Button
                    variant="ghost"
                    onClick={closeWizard}
                    className="text-gray-500 hover:text-black hover:bg-transparent"
                  >
                    Annuler
                  </Button>
                </div>
              )}
              
              {wizardStep === 1 && (
                <div className="flex justify-center w-full">
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    className="text-gray-500 hover:text-black hover:bg-transparent"
                  >
                    Précédent
                  </Button>
                </div>
              )}
              
              {wizardStep === 2 && (
                <div className="flex justify-center w-full">
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    className="text-gray-500 hover:text-black hover:bg-transparent"
                  >
                    Précédent
                  </Button>
                </div>
              )}
              
              {wizardStep === 3 && (
                <div className="flex flex-col gap-4 w-full">
                  {/* Bouton Confirmer */}
                  <Button
                    onClick={handleOperationSubmit}
                    disabled={isSubmittingOperation}
                    className="flex items-center gap-2 h-12 px-6 md:h-10 md:px-4"
                  >
                    {isSubmittingOperation ? 'En cours...' : 'Confirmer'}
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  
                  {/* Bouton Précédent centré et discret */}
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      onClick={prevStep}
                      className="text-gray-500 hover:text-black hover:bg-transparent"
                    >
                      Précédent
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stock actuel - Section simple */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Stock actuel</h3>
          {isStockLow && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Stock bas
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-gray-900">
            {currentQuantity} unités
          </div>
          
          {/* Bouton principal d'action */}
          <Button 
            onClick={startWizard}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Zap className="h-4 w-4 mr-2" />
            Modifier le stock
          </Button>
        </div>
      </div>

      {/* Paramètres de stock minimum - Section simple */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Stock minimum requis</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="min-stock-toggle" className="text-sm font-medium">Activer le stock minimum</Label>
              <p className="text-xs text-gray-600">Alerte quand le stock est bas</p>
            </div>
            <Switch
              id="min-stock-toggle"
              checked={minStockRequired}
              onCheckedChange={(checked) => {
                setMinStockRequired(checked);
                handleMinStockUpdate();
              }}
            />
          </div>

          {minStockRequired && (
            <div className="space-y-1">
              <Label htmlFor="min-stock-quantity" className="text-sm font-medium">Quantité minimum</Label>
              <Input
                id="min-stock-quantity"
                type="number"
                min="0"
                value={minStockQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setMinStockQuantity(value);
                  handleMinStockUpdate();
                }}
                className="w-32 h-8"
              />
            </div>
          )}
        </div>
      </div>

      {/* Historique des opérations - Section simple */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Historique des modifications</h3>
        </div>
        
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : operations.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune opération enregistrée</p>
              <p className="text-sm text-gray-400 mt-1">Utilisez le bouton "Modifier le stock" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-3">
              {operations.map((operation) => (
                <div key={operation.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">
                    {getOperationIcon(operation.operation_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge className={getOperationColor(operation.operation_type)}>
                        {operation.operation_type === 'add' && '+'}
                        {operation.operation_type === 'remove' && '-'}
                        {operation.quantity_change}
                      </Badge>
                      <span className="text-sm font-medium">{operation.reason}</span>
                    </div>
                    
                    {operation.notes && (
                      <p className="text-xs text-gray-600 mt-1">{operation.notes}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(operation.created_at).toLocaleString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {operation.quantity_before} → {operation.quantity_after}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wizard */}
      {showWizard && renderWizardStep()}
    </div>
  );
}