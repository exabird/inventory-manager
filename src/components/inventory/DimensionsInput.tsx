'use client';

/**
 * 📐 Composant de dimensions avec schéma visuel
 * Affiche un schéma 3D pour clarifier largeur/hauteur/profondeur
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DimensionsInputProps {
  width?: number;
  height?: number;
  depth?: number;
  onWidthChange: (value: number | undefined) => void;
  onHeightChange: (value: number | undefined) => void;
  onDepthChange: (value: number | undefined) => void;
}

export default function DimensionsInput({
  width,
  height,
  depth,
  onWidthChange,
  onHeightChange,
  onDepthChange
}: DimensionsInputProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Schéma visuel 3D */}
      <div className="flex items-center justify-center py-6">
        <svg width="280" height="180" viewBox="0 0 280 180" className="text-gray-600">
          {/* Boîte 3D en perspective */}
          {/* Face avant */}
          <rect x="80" y="60" width="120" height="100" 
            fill="white" stroke="currentColor" strokeWidth="2" />
          
          {/* Face droite (profondeur) */}
          <path d="M200 60 L240 40 L240 140 L200 160 Z" 
            fill="#f3f4f6" stroke="currentColor" strokeWidth="2" />
          
          {/* Face dessus */}
          <path d="M80 60 L120 40 L240 40 L200 60 Z" 
            fill="#e5e7eb" stroke="currentColor" strokeWidth="2" />
          
          {/* Flèches et labels */}
          {/* Largeur (width) */}
          <line x1="70" y1="170" x2="210" y2="170" 
            stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowblue)" markerStart="url(#arrowblue)" />
          <text x="140" y="185" textAnchor="middle" fontSize="12" fill="#3b82f6" fontWeight="600">
            Largeur
          </text>
          
          {/* Hauteur (height) */}
          <line x1="65" y1="165" x2="65" y2="55" 
            stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowgreen)" markerStart="url(#arrowgreen)" />
          <text x="35" y="115" textAnchor="middle" fontSize="12" fill="#10b981" fontWeight="600" 
            transform="rotate(-90, 35, 115)">
            Hauteur
          </text>
          
          {/* Profondeur (depth) */}
          <line x1="210" y1="165" x2="245" y2="145" 
            stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arroworange)" markerStart="url(#arroworange)" />
          <text x="245" y="160" textAnchor="middle" fontSize="12" fill="#f59e0b" fontWeight="600">
            Profondeur
          </text>
          
          {/* Définition des flèches */}
          <defs>
            <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <polygon points="0,0 10,5 0,10" fill="#3b82f6" />
            </marker>
            <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <polygon points="0,0 10,5 0,10" fill="#10b981" />
            </marker>
            <marker id="arroworange" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <polygon points="0,0 10,5 0,10" fill="#f59e0b" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Inputs pour les 3 dimensions */}
      <div className="grid grid-cols-3 gap-3">
        {/* Largeur */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-blue-600 flex items-center gap-1">
            <span className="text-base">↔</span>
            Largeur
          </Label>
          <div className="relative">
            <Input
              type="number"
              value={width ?? ''}
              onChange={(e) => onWidthChange(e.target.value ? Number(e.target.value) : undefined)}
              className="h-9 pr-10 border-blue-200 focus:border-blue-500"
              placeholder="0"
              min={0}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
              mm
            </span>
          </div>
        </div>

        {/* Hauteur */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-green-600 flex items-center gap-1">
            <span className="text-base">↕</span>
            Hauteur
          </Label>
          <div className="relative">
            <Input
              type="number"
              value={height ?? ''}
              onChange={(e) => onHeightChange(e.target.value ? Number(e.target.value) : undefined)}
              className="h-9 pr-10 border-green-200 focus:border-green-500"
              placeholder="0"
              min={0}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
              mm
            </span>
          </div>
        </div>

        {/* Profondeur */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-orange-600 flex items-center gap-1">
            <span className="text-base">⤢</span>
            Profondeur
          </Label>
          <div className="relative">
            <Input
              type="number"
              value={depth ?? ''}
              onChange={(e) => onDepthChange(e.target.value ? Number(e.target.value) : undefined)}
              className="h-9 pr-10 border-orange-200 focus:border-orange-500"
              placeholder="0"
              min={0}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
              mm
            </span>
          </div>
        </div>
      </div>

      {/* Note explicative */}
      <p className="text-xs text-gray-500 text-center italic">
        💡 Mesures en millimètres (vue de face du produit)
      </p>
    </div>
  );
}

