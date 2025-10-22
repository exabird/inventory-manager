'use client';

import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export interface FieldStatus {
  functional: boolean;
  reason?: string;
}

interface FieldWrapperProps {
  children: ReactNode;
  label: string;
  htmlFor?: string;
  status?: FieldStatus;
  className?: string;
}

export function FieldWrapper({ 
  children, 
  label, 
  htmlFor, 
  status, 
  className = '' 
}: FieldWrapperProps) {
  const isFunctional = status?.functional !== false;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Label htmlFor={htmlFor}>
          {label}
        </Label>
        {status && !isFunctional && (
          <div className="w-4 h-4 flex items-center justify-center">
            <X className="h-3 w-3 text-blue-500" />
          </div>
        )}
      </div>
      <div>
        {children}
      </div>
      {status && !isFunctional && status.reason && (
        <p className="text-xs text-blue-600 italic">
          {status.reason}
        </p>
      )}
    </div>
  );
}

interface FunctionalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  status?: FieldStatus;
  error?: string;
}

export function FunctionalInput({ 
  label, 
  status, 
  error, 
  className = '', 
  ...props 
}: FunctionalInputProps) {
  const isFunctional = status?.functional !== false;
  
  return (
    <FieldWrapper 
      label={label} 
      htmlFor={props.id} 
      status={status}
    >
      <Input
        {...props}
        className={`${className} ${!isFunctional ? 'border-blue-300 bg-blue-50' : ''} ${error ? 'border-red-500' : ''}`}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </FieldWrapper>
  );
}

interface FunctionalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  status?: FieldStatus;
  error?: string;
}

export function FunctionalTextarea({ 
  label, 
  status, 
  error, 
  className = '', 
  ...props 
}: FunctionalTextareaProps) {
  const isFunctional = status?.functional !== false;
  
  return (
    <FieldWrapper 
      label={label} 
      htmlFor={props.id} 
      status={status}
    >
      <Textarea
        {...props}
        className={`${className} ${!isFunctional ? 'border-blue-300 bg-blue-50' : ''} ${error ? 'border-red-500' : ''}`}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </FieldWrapper>
  );
}

interface FunctionalSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  status?: FieldStatus;
  error?: string;
  placeholder?: string;
}

export function FunctionalSelect({ 
  label, 
  value, 
  onChange, 
  children, 
  status, 
  error, 
  placeholder = "Sélectionner...",
  ...props 
}: FunctionalSelectProps) {
  const isFunctional = status?.functional !== false;
  
  return (
    <FieldWrapper 
      label={label} 
      status={status}
    >
      <select
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isFunctional ? 'border-blue-300 bg-blue-50' : 'border-gray-300'} ${error ? 'border-red-500' : ''}`}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </FieldWrapper>
  );
}
