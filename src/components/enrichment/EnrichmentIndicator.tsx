'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EnrichmentStep {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
}

interface EnrichmentIndicatorProps {
  isVisible: boolean;
  barcode: string;
  onComplete?: (success: boolean, data?: any) => void;
}

export default function EnrichmentIndicator({ 
  isVisible, 
  barcode, 
  onComplete 
}: EnrichmentIndicatorProps) {
  const [steps, setSteps] = useState<EnrichmentStep[]>([
    { id: 'openfoodfacts', name: 'Open Food Facts', status: 'pending' },
    { id: 'upcdatabase', name: 'UPC Database', status: 'pending' },
    { id: 'barcodelookup', name: 'Barcode Lookup', status: 'pending' },
    { id: 'claude', name: 'Claude AI', status: 'pending' },
  ]);
  
  const [isComplete, setIsComplete] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrichedData, setEnrichedData] = useState<any>(null);

  useEffect(() => {
    if (isVisible && barcode) {
      startEnrichment();
    }
  }, [isVisible, barcode]);

  const startEnrichment = async () => {
    try {
      console.log('🚀 Début de l\'enrichissement via API...');
      
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Enrichissement réussi:', result.data);
        setSuccess(true);
        setEnrichedData(result.data);
        setIsComplete(true);
        onComplete?.(true, result.data);
      } else {
        console.log('❌ Enrichissement échoué:', result.error);
        setError(result.error || 'Erreur inconnue');
        setIsComplete(true);
        onComplete?.(false);
      }
    } catch (err) {
      console.error('❌ Erreur lors de l\'enrichissement:', err);
      setError('Erreur de connexion');
      setIsComplete(true);
      onComplete?.(false);
    }
  };

  const getStepIcon = (status: EnrichmentStep['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStepColor = (status: EnrichmentStep['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              {isComplete ? (
                success ? (
                  <CheckCircle className="h-12 w-12 text-green-600" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-600" />
                )
              ) : (
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {isComplete 
                ? (success ? '✅ Enrichissement réussi !' : '❌ Enrichissement échoué')
                : '🤖 Enrichissement en cours...'
              }
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {isComplete 
                ? (success 
                    ? 'Les informations du produit ont été trouvées et pré-remplies'
                    : error || 'Aucune information trouvée pour ce code-barres'
                  )
                : `Recherche des informations pour le code: ${barcode}`
              }
            </p>
          </div>

          {/* Étapes d'enrichissement */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  step.status === 'loading' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : step.status === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : step.status === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${getStepColor(step.status)}`}>
                    {step.name}
                  </p>
                  {step.message && (
                    <p className="text-xs text-gray-500 mt-1">
                      {step.message}
                    </p>
                  )}
                </div>
                {step.status === 'success' && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Trouvé
                  </Badge>
                )}
                {step.status === 'error' && (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Non trouvé
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Informations sur la source */}
          {isComplete && success && enrichedData && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Données trouvées via {enrichedData.source} - Temps: {enrichedData.responseTime}ms
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
