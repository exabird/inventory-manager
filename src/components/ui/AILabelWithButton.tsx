'use client';

/**
 * 🏷️ Label avec bouton IA intégré
 * Wrapper pour simplifier l'ajout de boutons IA sur tous les champs
 */

import { ReactNode } from 'react';
import AIFieldButton from './AIFieldButton';

interface AILabelWithButtonProps {
  htmlFor?: string;
  children: ReactNode;
  icon?: ReactNode;
  fieldKey: string;
  fieldLabel: string;
  productName?: string;
  productBarcode?: string;
  isAIGenerated?: boolean;
  onFillComplete: (value: any) => void;
  className?: string;
}

export default function AILabelWithButton({
  htmlFor,
  children,
  icon,
  fieldKey,
  fieldLabel,
  productName,
  productBarcode,
  isAIGenerated = false,
  onFillComplete,
  className
}: AILabelWithButtonProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`flex items-center gap-2 text-sm font-medium text-gray-700 group/ailabel ${className || ''}`}
    >
      {icon}
      {children}
      
      {/* Bouton IA juste après le label (visible au hover ou si déjà rempli par IA) */}
      <span className={isAIGenerated ? 'opacity-100' : 'opacity-0 group-hover/ailabel:opacity-100 transition-opacity'}>
        <AIFieldButton
          fieldKey={fieldKey}
          fieldLabel={fieldLabel}
          productName={productName}
          productBarcode={productBarcode}
          isAIGenerated={isAIGenerated}
          onFillComplete={onFillComplete}
        />
      </span>
    </label>
  );
}

