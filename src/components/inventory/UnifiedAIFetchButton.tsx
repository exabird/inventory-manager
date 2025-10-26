'use client';

import React, { useState } from 'react';
import { Sparkles, ChevronDown, FileText, Image, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import AIFetchTimeline from './AIFetchTimeline';

export type AIFetchMode = 'metas' | 'images' | 'all';

export interface AIFetchProgress {
  mode: AIFetchMode;
  step: 'idle' | 'fetching_metas' | 'fetching_images' | 'finding_url' | 'scraping_page' | 'downloading_images' | 'classifying_images' | 'setting_featured' | 'complete' | 'error';
  message?: string;
  metasCount?: number;
  imagesCount?: number;
  completedSteps?: string[];
}

interface UnifiedAIFetchButtonProps {
  onFetch: (mode: AIFetchMode) => Promise<void>;
  progress: AIFetchProgress;
  disabled?: boolean;
  className?: string;
}

const getModeLabel = (mode: AIFetchMode): string => {
  switch (mode) {
    case 'metas': return 'Métadonnées uniquement';
    case 'images': return 'Images uniquement';
    case 'all': return 'Métadonnées + Images';
    default: return 'Fetch IA';
  }
};

const getModeIcon = (mode: AIFetchMode) => {
  switch (mode) {
    case 'metas': return <FileText className="h-3 w-3" />;
    case 'images': return <Image className="h-3 w-3" />;
    case 'all': return <Zap className="h-3 w-3" />;
    default: return <Sparkles className="h-3 w-3" />;
  }
};

const getStepLabel = (step: AIFetchProgress['step'], mode: AIFetchMode): string => {
  switch (step) {
    case 'fetching_metas': return 'Récupération des métadonnées...';
    case 'fetching_images': return 'Téléchargement des images...';
    case 'complete': 
      if (mode === 'metas') return 'Métadonnées récupérées ✓';
      if (mode === 'images') return 'Images récupérées ✓';
      return 'Fetch complet terminé ✓';
    case 'error': return 'Erreur lors du fetch';
    default: return 'Prêt pour le fetch IA';
  }
};

const UnifiedAIFetchButton: React.FC<UnifiedAIFetchButtonProps> = ({
  onFetch,
  progress,
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isLoading = progress.step !== 'idle' && progress.step !== 'complete' && progress.step !== 'error';

  const handleModeSelect = async (mode: AIFetchMode) => {
    setIsOpen(false);
    await onFetch(mode);
  };

  const getTooltipContent = () => {
    const stepLabel = getStepLabel(progress.step, progress.mode);
    
    // Afficher le résumé si des données ont été récupérées (pendant ou après le process)
    const hasCounts = progress.metasCount || progress.imagesCount;
    const summary = hasCounts
      ? `\n\n${progress.step === 'complete' ? 'Résumé' : 'En cours'}:\n${progress.metasCount ? `• ${progress.metasCount} métadonnée${progress.metasCount > 1 ? 's' : ''}` : ''}${progress.imagesCount ? `\n• ${progress.imagesCount} image${progress.imagesCount > 1 ? 's' : ''}` : ''}`
      : '';
    
    return `${stepLabel}${summary}`;
  };

  // Afficher le tooltip UNIQUEMENT si en cours ou si on a des résultats
  const hasResults = progress.step === 'complete' || progress.step === 'error' || (progress.completedSteps && progress.completedSteps.length > 0);
  
  // Ne PAS afficher en mode idle sans résultats
  const shouldShowTooltip = (isLoading || hasResults) && progress.step !== 'idle';

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <Tooltip open={shouldShowTooltip ? (isLoading ? true : undefined) : undefined} delayDuration={isLoading ? 0 : 300}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || isLoading}
                className={cn(
                  "h-8 w-8 relative transition-all duration-300",
                  "[&::before]:hidden [&::after]:hidden [&_*::before]:hidden [&_*::after]:hidden", // Masquer TOUS les pseudo-éléments
                  isLoading && "bg-purple-50 shadow-sm scale-110 cursor-wait",
                  progress.step === 'error' && "bg-red-50",
                  progress.step === 'complete' && "bg-green-50 shadow-sm",
                  !isLoading && progress.step === 'idle' && "hover:bg-purple-50 hover:shadow-sm"
                )}
              >
                {isLoading ? (
                  <div className="relative flex items-center justify-center h-full w-full">
                    {/* Cercle de progression */}
                    <svg className="h-6 w-6 -rotate-90 absolute -inset-0.5" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-purple-200"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${2 * Math.PI * 10}`}
                        strokeDashoffset={`${2 * Math.PI * 10 * (1 - (progress.step === 'fetching_metas' ? 0.5 : 1))}`}
                        className="text-purple-600 transition-all duration-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <Sparkles className="h-3.5 w-3.5 text-purple-600 animate-pulse relative z-10" />
                  </div>
                ) : progress.step === 'complete' ? (
                  <Sparkles className="h-4 w-4 text-green-600" />
                ) : progress.step === 'error' ? (
                  <Sparkles className="h-4 w-4 text-red-600" />
                ) : (
                  <Sparkles className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          
          <TooltipContent className="max-w-sm p-0 bg-white shadow-xl rounded-lg border border-gray-200">
            <div className="p-3">
              <AIFetchTimeline progress={progress} />
            </div>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem 
            onClick={() => handleModeSelect('metas')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4 text-blue-600" />
            <div>
              <div className="font-medium">Métadonnées uniquement</div>
              <div className="text-xs text-gray-500">Remplit les champs vides</div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleModeSelect('images')}
            className="flex items-center gap-2"
          >
            <Image className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-medium">Images uniquement</div>
              <div className="text-xs text-gray-500">Télécharge et classe les images</div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleModeSelect('all')}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4 text-purple-600" />
            <div>
              <div className="font-medium">Métadonnées + Images</div>
              <div className="text-xs text-gray-500">Fetch complet séquentiel</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UnifiedAIFetchButton;

