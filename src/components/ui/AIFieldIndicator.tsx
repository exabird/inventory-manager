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


