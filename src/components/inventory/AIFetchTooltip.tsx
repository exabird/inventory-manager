'use client';

import React from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface AIFetchStep {
  label: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string; // Message d'erreur ou de succès détaillé
  timestamp?: Date; // Quand l'étape a commencé/fini
}

interface AIFetchTooltipProps {
  steps: AIFetchStep[];
  children: React.ReactNode;
}

const AIFetchTooltip: React.FC<AIFetchTooltipProps> = ({ steps, children }) => {
  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Toujours afficher le tooltip, même si les étapes sont vides ou toutes en pending
  const hasSteps = steps && steps.length > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent className="w-80 p-4 bg-white shadow-lg rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold mb-2 text-gray-800">Progression du Fetch IA</h4>
        {hasSteps ? (
          <ul className="space-y-2">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <div className="flex-shrink-0 mt-0.5">
                  {step.status === 'loading' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {step.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {step.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                  {step.status === 'pending' && <span className="h-2 w-2 rounded-full bg-gray-300 block mt-1.5" />}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "font-medium",
                    step.status === 'loading' && "text-blue-600",
                    step.status === 'success' && "text-green-600",
                    step.status === 'error' && "text-red-600"
                  )}>
                    {step.label}
                    {step.timestamp && <span className="ml-2 text-xs text-gray-500">{formatTime(step.timestamp)}</span>}
                  </p>
                  {step.message && (
                    <p className={cn(
                      "text-xs mt-0.5 whitespace-pre-wrap",
                      step.status === 'error' ? "text-red-500" : "text-gray-500"
                    )}>
                      {step.message}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Prêt pour le fetch IA</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

export default AIFetchTooltip;