'use client';

import React from 'react';
import { Check, Loader2, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIFetchProgress } from './UnifiedAIFetchButton';

interface AIFetchTimelineProps {
  progress: AIFetchProgress;
}

interface TimelineStep {
  id: string;
  label: string;
  mode: 'metas' | 'images' | 'all';
}

const timelineSteps: TimelineStep[] = [
  { id: 'fetching_metas', label: 'Recherche métadonnées', mode: 'metas' },
  { id: 'finding_url', label: 'Recherche URL produit', mode: 'images' },
  { id: 'scraping_page', label: 'Scraping page', mode: 'images' },
  { id: 'downloading_images', label: 'Téléchargement images', mode: 'images' },
  { id: 'classifying_images', label: 'Classification IA', mode: 'images' },
  { id: 'setting_featured', label: 'Image principale', mode: 'images' },
];

export default function AIFetchTimeline({ progress }: AIFetchTimelineProps) {
  const { mode, step, completedSteps = [], metasCount, imagesCount } = progress;

  // Filtrer les étapes selon le mode
  const relevantSteps = timelineSteps.filter(s => 
    mode === 'all' ? true : s.mode === mode || s.mode === 'all'
  );

  const getStepStatus = (stepId: string): 'complete' | 'current' | 'pending' | 'error' => {
    if (progress.step === 'error') {
      // En erreur : marquer les complétées en vert, la courante en rouge, le reste en pending
      if (completedSteps.includes(stepId)) return 'complete';
      if (stepId === step) return 'error';
      return 'pending';
    }

    if (completedSteps.includes(stepId)) return 'complete';
    if (stepId === step) return 'current';
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <Check className="h-3.5 w-3.5 text-green-600" />;
      case 'current':
        return <Loader2 className="h-3.5 w-3.5 text-purple-600 animate-spin" />;
      case 'error':
        return <X className="h-3.5 w-3.5 text-red-600" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-300" />;
    }
  };

  // Si idle et pas de steps complétés, ne rien afficher
  if (step === 'idle' && completedSteps.length === 0) {
    return null;
  }

  return (
    <div className="py-2">
      {/* En-tête */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-semibold text-gray-900">
          {step === 'complete' ? 'Fetch terminé' : 
           step === 'error' ? 'Erreur' : 
           'Fetch en cours...'}
        </span>
      </div>

      {/* Timeline verticale */}
      <div className="space-y-1 relative pl-1">
        {/* Ligne verticale */}
        <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200" />

        {relevantSteps.map((timelineStep, index) => {
          const status = getStepStatus(timelineStep.id);
          const isLast = index === relevantSteps.length - 1;

          return (
            <div 
              key={timelineStep.id} 
              className={cn(
                "relative flex items-center gap-3 py-1.5",
                !isLast && "pb-2"
              )}
            >
              {/* Icône d'état */}
              <div className={cn(
                "relative z-10 flex items-center justify-center h-5 w-5 rounded-full border-2",
                status === 'complete' && "bg-green-50 border-green-600",
                status === 'current' && "bg-purple-50 border-purple-600",
                status === 'error' && "bg-red-50 border-red-600",
                status === 'pending' && "bg-white border-gray-300"
              )}>
                {getStepIcon(status)}
              </div>

              {/* Label */}
              <span className={cn(
                "text-sm flex-1",
                status === 'complete' && "text-gray-700 font-medium",
                status === 'current' && "text-purple-900 font-semibold",
                status === 'error' && "text-red-700 font-medium",
                status === 'pending' && "text-gray-400"
              )}>
                {timelineStep.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Résumé si terminé ou en cours */}
      {(step === 'complete' || metasCount || imagesCount) && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
          <div className="text-xs font-semibold text-gray-700 mb-1.5">
            {step === 'complete' ? '✓ Résumé' : 'En cours'}
          </div>
          {metasCount !== undefined && metasCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>{metasCount} métadonnée{metasCount > 1 ? 's' : ''}</span>
            </div>
          )}
          {imagesCount !== undefined && imagesCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span>{imagesCount} image{imagesCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}

      {/* Message d'erreur */}
      {step === 'error' && progress.message && (
        <div className="mt-3 pt-3 border-t border-red-200 bg-red-50 -mx-3 -mb-2 px-3 py-2 rounded-b-lg">
          <div className="text-xs font-semibold text-red-700 mb-1">❌ Erreur</div>
          <div className="text-xs text-red-600">{progress.message}</div>
        </div>
      )}

      {/* Aide en bas si terminé */}
      {step === 'complete' && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-400 text-center italic">
            Le résumé reste visible au hover
          </div>
        </div>
      )}
    </div>
  );
}

