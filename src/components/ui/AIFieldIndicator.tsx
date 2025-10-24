'use client';

import { Sparkles, Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AIFieldIndicatorProps {
  isAIGenerated?: boolean;
  confidence?: number;
  className?: string;
}

export function AIFieldIndicator({ isAIGenerated, confidence, className }: AIFieldIndicatorProps) {
  if (!isAIGenerated) return null;

  const getConfidenceColor = () => {
    if (!confidence) return 'bg-blue-500';
    if (confidence >= 85) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getConfidenceIcon = () => {
    if (!confidence) return <Sparkles className="h-3 w-3" />;
    if (confidence >= 85) return <Check className="h-3 w-3" />;
    return <AlertCircle className="h-3 w-3" />;
  };

  return (
    <Badge 
      variant="secondary"
      className={cn(
        'absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-white',
        getConfidenceColor(),
        className
      )}
      title={`Rempli par IA${confidence ? ` - Confiance: ${confidence}%` : ''}`}
    >
      {getConfidenceIcon()}
    </Badge>
  );
}

interface AIInputWrapperProps {
  children: React.ReactNode;
  isAIGenerated?: boolean;
  confidence?: number;
  className?: string;
}

export function AIInputWrapper({ children, isAIGenerated, confidence, className }: AIInputWrapperProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      <AIFieldIndicator isAIGenerated={isAIGenerated} confidence={confidence} />
    </div>
  );
}

// Indicateur IA inline pour les labels
interface AILabelIndicatorProps {
  isAIGenerated?: boolean;
  className?: string;
}

export function AILabelIndicator({ isAIGenerated, className }: AILabelIndicatorProps) {
  if (!isAIGenerated) return null;

  return (
    <span title="Rempli par IA">
      <Sparkles 
        className={cn('h-3.5 w-3.5 text-purple-500 ml-1.5 inline-block', className)} 
      />
    </span>
  );
}

// Wrapper pour Label avec indicateur IA
interface AILabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  isAIGenerated?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function AILabel({ htmlFor, children, isAIGenerated, icon, className }: AILabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('flex items-center gap-2 text-sm font-medium text-gray-700', className)}
    >
      {icon}
      {children}
      <AILabelIndicator isAIGenerated={isAIGenerated} />
    </label>
  );
}


