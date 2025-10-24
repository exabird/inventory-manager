'use client';

/**
 * 🌟 Bouton IA pour remplir un champ unique
 * Affiche une étoile grisée au hover qui permet de remplir uniquement ce champ avec l'IA
 * Pour long_description : propose 2 modes (Description longue / Récopie complète)
 */

import { useState } from 'react';
import { Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AIFieldButtonProps {
  fieldKey: string;
  fieldLabel: string;
  productName?: string;
  productBarcode?: string;
  isAIGenerated?: boolean;
  onFillComplete: (value: any) => void;
  className?: string;
}

export default function AIFieldButton({
  fieldKey,
  fieldLabel,
  productName,
  productBarcode,
  isAIGenerated = false,
  onFillComplete,
  className
}: AIFieldButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Champs avec menu de choix
  const hasChoices = fieldKey === 'long_description';

  const handleFillField = async (mode?: 'standard' | 'full_copy') => {
    if (!productName && !productBarcode) {
      alert('Veuillez d\'abord renseigner le nom ou code-barres du produit');
      return;
    }

    // Récupérer la clé API depuis les paramètres sauvegardés
    const savedSettings = localStorage.getItem('ai_settings');
    let apiKey = null;
    let aiModel = 'claude-sonnet-4-20250514'; // Par défaut
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      apiKey = settings.claudeApiKey;
      aiModel = settings.model || aiModel;
    }
    
    if (!apiKey) {
      alert('⚠️ Clé API Claude non configurée.\n\nAllez dans Paramètres → API Claude pour configurer votre clé API Anthropic.');
      return;
    }

    setIsLoading(true);
    setIsMenuOpen(false);
    
    const modeLabel = mode === 'full_copy' ? 'Récopie complète' : 'Standard';
    console.log(`🌟 [AIFieldButton] Remplissage IA du champ: ${fieldKey} (${modeLabel})`);
    console.log('🔑 [AIFieldButton] Clé API récupérée depuis les paramètres');

    try {
      const requestBody = {
        name: productName,
        barcode: productBarcode,
        targetField: fieldKey,
        mode: mode || 'standard',
        apiKey: apiKey,
        model: aiModel
      };
      
      console.log('📤 [AIFieldButton] Requête:', { ...requestBody, apiKey: '***' });
      
      const response = await fetch('/api/ai-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 [AIFieldButton] Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [AIFieldButton] Erreur API:', errorData);
        throw new Error(errorData.error || 'Erreur lors du remplissage IA');
      }

      const result = await response.json();
      console.log('✅ [AIFieldButton] Réponse complète:', result);

      // Vérifier si des images ont été uploadées
      if (result.supabaseImages && result.supabaseImages.length > 0) {
        console.log('🖼️ [AIFieldButton] Images uploadées dans Supabase:', result.supabaseImages.length);
        alert(`✅ ${result.supabaseImages.length} image(s) récupérée(s) et uploadée(s) dans Supabase !`);
      }

      // L'API retourne { success: true, data: { ... }, aiGenerated: true }
      const aiData = result.data || result;
      console.log('✅ [AIFieldButton] Données IA:', aiData);

      // Extraire la valeur du champ ciblé
      const fieldValue = aiData[fieldKey];
      
      if (fieldValue !== undefined && fieldValue !== null) {
        onFillComplete(fieldValue);
        console.log(`✅ [AIFieldButton] Champ ${fieldKey} rempli:`, fieldValue);
      } else {
        console.warn(`⚠️ [AIFieldButton] Aucune valeur retournée pour ${fieldKey}`);
        console.warn('⚠️ [AIFieldButton] Structure reçue:', aiData);
        alert(`L'IA n'a pas pu trouver d'information pour "${fieldLabel}"`);
      }
    } catch (error: any) {
      console.error('❌ [AIFieldButton] Erreur:', error);
      alert(error.message || 'Erreur lors du remplissage automatique');
    } finally {
      setIsLoading(false);
    }
  };

  // Bouton simple pour les champs sans choix
  if (!hasChoices) {
    return (
      <button
        type="button"
        onClick={() => handleFillField()}
        disabled={isLoading}
        className={cn(
          'p-0.5 rounded transition-all duration-150',
          isAIGenerated 
            ? 'text-purple-500 hover:text-purple-600'
            : 'text-gray-300 hover:text-purple-500 hover:scale-110',
          isLoading && 'cursor-not-allowed opacity-50',
          className
        )}
        title={isLoading ? 'Remplissage en cours...' : `Remplir "${fieldLabel}" avec l'IA`}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
      </button>
    );
  }

  // Menu dropdown pour long_description
  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isLoading}
          className={cn(
            'flex items-center gap-0.5 p-0.5 rounded transition-all duration-150',
            isAIGenerated 
              ? 'text-purple-500 hover:text-purple-600'
              : 'text-gray-300 hover:text-purple-500 hover:scale-110',
            isLoading && 'cursor-not-allowed opacity-50',
            className
          )}
          title={isLoading ? 'Remplissage en cours...' : `Remplir "${fieldLabel}" avec l'IA`}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <ChevronDown className="h-2.5 w-2.5" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem 
          onClick={() => handleFillField('standard')}
          className="cursor-pointer"
        >
          <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
          <div>
            <div className="font-medium">Description longue</div>
            <div className="text-xs text-gray-500">Quelques paragraphes résumés</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleFillField('full_copy')}
          className="cursor-pointer"
        >
          <Sparkles className="h-4 w-4 mr-2 text-pink-500" />
          <div>
            <div className="font-medium">Récopie complète</div>
            <div className="text-xs text-gray-500">Page fabricant + images (URLs)</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

