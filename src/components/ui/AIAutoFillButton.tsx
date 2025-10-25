'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AIFillStep = 'idle' | 'starting' | 'fetching_metadata' | 'scraping_images' | 'classifying_images' | 'complete' | 'error';

interface AIAutoFillButtonProps {
  step: AIFillStep;
  onClick: () => void;
  className?: string;
  completeSummary?: { images: number; metas: number }; // Résumé du remplissage
  variant?: 'list' | 'inspector'; // 🆕 Variante pour le contexte d'affichage
}

const getStepLabel = (step: AIFillStep): string => {
  switch (step) {
    case 'starting': return 'Préparation...';
    case 'fetching_metadata': return 'Récupération métadonnées IA';
    case 'scraping_images': return 'Téléchargement images';
    case 'classifying_images': return 'Classification par IA';
    case 'complete': return 'Terminé !';
    case 'error': return 'Erreur';
    default: return '';
  }
};

export default function AIAutoFillButton({ step, onClick, className, completeSummary, variant = 'list' }: AIAutoFillButtonProps) {
  const isLoading = step !== 'idle' && step !== 'complete' && step !== 'error';
  
  const getStepProgress = () => {
    switch (step) {
      case 'starting': return 10;
      case 'fetching_metadata': return 30;
      case 'scraping_images': return 60;
      case 'classifying_images': return 85;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const progress = getStepProgress();
  const stepLabel = getStepLabel(step);

  // Générer le résumé si disponible
  const getSummaryLabel = () => {
    if (!completeSummary) return '✓ Terminé';
    const parts = [];
    if (completeSummary.images > 0) parts.push(`${completeSummary.images} image${completeSummary.images > 1 ? 's' : ''}`);
    if (completeSummary.metas > 0) parts.push(`${completeSummary.metas} méta${completeSummary.metas > 1 ? 's' : ''}`);
    return parts.length > 0 ? `✓ ${parts.join(', ')}` : '✓ Terminé';
  };

  return (
    <div className={cn("relative inline-flex items-center gap-2 z-10", className)}>
      {/* Bouton icône */}
      <button
        type="button"
        className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center relative transition-all duration-300 group/btn flex-shrink-0",
          // 🆕 Comportement différent selon le contexte
          variant === 'list' && !isLoading && step === 'idle' && "opacity-0 group-hover:opacity-100",
          isLoading && "pointer-events-none bg-purple-50 shadow-sm scale-110",
          step === 'error' && "bg-red-50",
          step === 'complete' && "bg-green-50 shadow-sm",
          !isLoading && step === 'idle' && "hover:bg-purple-50 hover:shadow-sm"
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (!isLoading) onClick();
        }}
        title="Remplissage IA automatique"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="relative flex items-center justify-center h-full w-full">
            {/* Cercle de progression AGRANDI */}
            <svg className="h-8 w-8 -rotate-90 absolute -inset-0.5" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-purple-200"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                className="text-purple-600 transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <Sparkles className="h-3.5 w-3.5 text-purple-600 animate-pulse relative z-10" />
          </div>
        ) : step === 'complete' ? (
          <Sparkles className="h-4 w-4 text-green-600" />
        ) : step === 'error' ? (
          <Sparkles className="h-4 w-4 text-red-600" />
        ) : (
          <Sparkles className="h-4 w-4 text-purple-600 group-hover/btn:scale-110 transition-transform" />
        )}
      </button>

      {/* Label de l'étape (supprimé - maintenant dans le tooltip) */}
      {/* {isLoading && (
        <span className="text-[11px] leading-tight font-medium text-purple-600 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200 flex items-center h-7">
          {stepLabel}
        </span>
      )} */}
      
      {/* Label succès avec résumé (supprimé - maintenant dans le tooltip) */}
      {/* {step === 'complete' && (
        <span className="text-[11px] leading-tight font-medium text-green-600 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200 flex items-center h-7">
          {getSummaryLabel()}
        </span>
      )} */}
    </div>
  );
}

