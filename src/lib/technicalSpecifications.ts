/**
 * 📋 Système centralisé des spécifications techniques
 * 
 * Ce fichier définit TOUTES les spécifications techniques disponibles
 * pour faciliter la réutilisation dans :
 * - L'éditeur de produits
 * - Les filtres de recherche
 * - Les exports/imports
 * - Les rapports
 */

import React from 'react';
import { 
  Cpu, Monitor, Usb, Wifi, Battery, Package, 
  Award, HardDrive, Speaker, Gauge, Shield, Box,
  Zap, Sun, Clock, Palette, Ruler, Weight, Layers,
  Radio, Volume2, Waves, Lock, Droplets, Hand,
  CreditCard, FileText
} from 'lucide-react';

// Types de champs disponibles
export type FieldType = 
  | 'text'      // Input texte simple
  | 'number'    // Input numérique
  | 'boolean'   // Toggle switch (true/false)
  | 'tags'      // Input avec tags multiples
  | 'select';   // Dropdown avec valeurs prédéfinies

// Catégories de spécifications
export type SpecCategory = 
  | 'Processeur/RAM'
  | 'Stockage'
  | 'Écran'
  | 'Connectivité'
  | 'Alimentation'
  | 'Dimensions'
  | 'Audio'
  | 'Design'
  | 'Performance'
  | 'Sécurité'
  | 'Garantie';

// Définition d'un champ de spécification
export interface SpecField {
  key: string;
  label: string;
  type: FieldType;
  category: SpecCategory;
  icon: React.ComponentType<{ className?: string }>;
  unit?: string;              // Unité d'affichage (W, mm, Hz, etc.)
  placeholder?: string;
  options?: string[];         // Options pour select
  defaultTags?: string[];     // Tags par défaut pour suggestions
  description?: string;       // Description du champ
  min?: number;              // Valeur min pour number
  max?: number;              // Valeur max pour number
}

/**
 * 🎯 DÉFINITION DE TOUS LES CHAMPS DISPONIBLES
 * Organisés par catégorie pour faciliter la maintenance
 */
export const TECHNICAL_SPEC_FIELDS: SpecField[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💻 PROCESSEUR / RAM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    key: 'processor',
    label: 'Processeur',
    type: 'text',
    category: 'Processeur/RAM',
    icon: Cpu,
    placeholder: 'Intel Core i5-1135G7'
  },
  {
    key: 'ram_gb',
    label: 'RAM',
    type: 'number',
    category: 'Processeur/RAM',
    icon: Cpu,
    unit: 'Go',
    min: 1,
    max: 512
  },
  {
    key: 'cores',
    label: 'Cœurs CPU',
    type: 'number',
    category: 'Processeur/RAM',
    icon: Cpu,
    min: 1,
    max: 128
  },
  {
    key: 'threads',
    label: 'Threads',
    type: 'number',
    category: 'Processeur/RAM',
    icon: Cpu,
    min: 1,
    max: 256
  },
  {
    key: 'graphics_card',
    label: 'Carte graphique',
    type: 'text',
    category: 'Processeur/RAM',
    icon: Cpu,
    placeholder: 'NVIDIA RTX 4090'
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💾 STOCKAGE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    key: 'storage_gb',
    label: 'Capacité',
    type: 'number',
    category: 'Stockage',
    icon: HardDrive,
    unit: 'Go',
    min: 1
  },
  {
    key: 'storage_type',
    label: 'Type de stockage',
    type: 'select',
    category: 'Stockage',
    icon: Layers,
    options: ['SSD NVMe', 'SSD SATA', 'HDD', 'eMMC', 'Hybride']
  },
  {
    key: 'operating_system',
    label: 'Système d\'exploitation',
    type: 'select',
    category: 'Stockage',
    icon: FileText,
    options: [
      'Windows 11 Pro',
      'Windows 11 Home',
      'Windows 10 Pro',
      'macOS',
      'Linux',
      'Chrome OS',
      'Android',
      'iOS',
      'Sans OS'
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🖥️ ÉCRAN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    key: 'screen_size_inches',
    label: 'Taille écran',
    type: 'number',
    category: 'Écran',
    icon: Monitor,
    unit: 'pouces',
    min: 1,
    max: 100
  },
  {
    key: 'resolution',
    label: 'Résolution',
    type: 'select',
    category: 'Écran',
    icon: Monitor,
    options: [
      '1920x1080 (Full HD)',
      '2560x1440 (QHD)',
      '3840x2160 (4K)',
      '7680x4320 (8K)',
      '1366x768',
      '1280x720'
    ]
  },
  {
    key: 'refresh_rate_hz',
    label: 'Taux de rafraîch.',
    type: 'number',
    category: 'Écran',
    icon: Monitor,
    unit: 'Hz',
    min: 30,
    max: 480
  },
  {
    key: 'panel_type',
    label: 'Type de dalle',
    type: 'select',
    category: 'Écran',
    icon: Monitor,
    options: ['IPS', 'VA', 'TN', 'OLED', 'QLED', 'Mini-LED']
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔌 CONNECTIVITÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    key: 'hdmi_ports',
    label: 'Ports HDMI',
    type: 'number',
    category: 'Connectivité',
    icon: Usb,
    min: 0,
    max: 10
  },
  {
    key: 'displayport_ports',
    label: 'Ports DisplayPort',
    type: 'number',
    category: 'Connectivité',
    icon: Usb,
    min: 0,
    max: 10
  },
  {
    key: 'usb_ports',
    label: 'Ports USB-A',
    type: 'number',
    category: 'Connectivité',
    icon: Usb,
    min: 0,
    max: 20
  },
  {
    key: 'usb_type_c_ports',
    label: 'Ports USB-C',
    type: 'number',
    category: 'Connectivité',
    icon: Usb,
    min: 0,
    max: 10
  },
  {
    key: 'ethernet_ports',
    label: 'Ports Ethernet (nombre)',
    type: 'number',
    category: 'Connectivité',
    icon: Usb,
    min: 0,
    max: 10
  },
  {
    key: 'ethernet_port',
    label: 'Port Ethernet',
    type: 'boolean',
    category: 'Connectivité',
    icon: Usb,
    description: 'Présence d\'un port Ethernet'
  },
  {
    key: 'wifi',
    label: 'Wi-Fi',
    type: 'select',
    category: 'Connectivité',
    icon: Wifi,
    options: ['Wi-Fi 7', 'Wi-Fi 6E', 'Wi-Fi 6', 'Wi-Fi 5', 'Wi-Fi 4', 'Non']
  },
  {
    key: 'bluetooth',
    label: 'Bluetooth',
    type: 'select',
    category: 'Connectivité',
    icon: Wifi,
    options: ['5.4', '5.3', '5.2', '5.1', '5.0', '4.2', '4.0', 'Non']
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚡ ALIMENTATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    key: 'power_watts',
    label: 'Consommation',
    type: 'number',
    category: 'Alimentation',
    icon: Battery,
    unit: 'W',
    min: 0
  },
  {
    key: 'power_output_watts',
    label: 'Puissance sortie',
    type: 'number',
    category: 'Alimentation',
    icon: Battery,
    unit: 'W',
    min: 0,
    description: 'Puissance de sortie audio ou électrique'
  },
  {
    key: 'voltage',
    label: 'Voltage',
    type: 'text',
    category: 'Alimentation',
    icon: Battery,
    placeholder: '220-240V'
  },
  {
    key: 'battery_capacity_mah',
    label: 'Capacité batterie',
    type: 'number',
    category: 'Alimentation',
    icon: Battery,
    unit: 'mAh',
    min: 0
  },
  {
    key: 'battery_life_hours',
    label: 'Autonomie',
    type: 'number',
    category: 'Alimentation',
    icon: Battery,
    unit: 'heures',
    min: 0
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📏 DIMENSIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    key: 'weight_kg',
    label: 'Poids',
    type: 'number',
    category: 'Dimensions',
    icon: Weight,
    unit: 'kg',
    min: 0
  },
  {
    key: 'weight_g',
    label: 'Poids',
    type: 'number',
    category: 'Dimensions',
    icon: Weight,
    unit: 'g',
    min: 0
  },
  {
    key: 'width_mm',
    label: 'Largeur',
    type: 'number',
    category: 'Dimensions',
    icon: Ruler,
    unit: 'mm',
    min: 0
  },
  {
    key: 'height_mm',
    label: 'Hauteur',
    type: 'number',
    category: 'Dimensions',
    icon: Ruler,
    unit: 'mm',
    min: 0
  },
  {
    key: 'depth_mm',
    label: 'Profondeur',
    type: 'number',
    category: 'Dimensions',
    icon: Ruler,
    unit: 'mm',
    min: 0
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎵 AUDIO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    key: 'frequency_response',
    label: 'Réponse en fréquence',
    type: 'text',
    category: 'Audio',
    icon: Waves,
    placeholder: '50 Hz - 20 kHz'
  },
  {
    key: 'audio_formats',
    label: 'Formats audio',
    type: 'tags',
    category: 'Audio',
    icon: FileText,
    defaultTags: ['MP3', 'AAC', 'WAV', 'FLAC', 'ALAC', 'OGG', 'WMA', 'AIFF', 'DSD'],
    description: 'Formats audio supportés'
  },
  {
    key: 'audio_inputs',
    label: 'Entrées audio',
    type: 'tags',
    category: 'Audio',
    icon: Radio,
    defaultTags: ['Wi-Fi', 'Bluetooth', 'AirPlay 2', 'Spotify Connect', 'Ethernet', 'AUX', 'Optical'],
    description: 'Méthodes de connexion audio'
  },
  {
    key: 'voice_assistants',
    label: 'Assistants vocaux',
    type: 'tags',
    category: 'Audio',
    icon: Volume2,
    defaultTags: ['Amazon Alexa', 'Google Assistant', 'Siri', 'Bixby'],
    description: 'Assistants vocaux intégrés'
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎨 DESIGN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    key: 'color',
    label: 'Couleur',
    type: 'text',
    category: 'Design',
    icon: Palette,
    placeholder: 'Noir, Blanc, Argent...'
  },
  {
    key: 'material',
    label: 'Matériau',
    type: 'select',
    category: 'Design',
    icon: Box,
    options: ['Aluminium', 'Plastique', 'Métal', 'Bois', 'Verre', 'Tissu', 'Composite']
  },
  {
    key: 'touch_controls',
    label: 'Contrôles tactiles',
    type: 'boolean',
    category: 'Design',
    icon: Hand,
    description: 'Présence de contrôles tactiles'
  },
  {
    key: 'humidity_resistant',
    label: 'Résistant humidité',
    type: 'boolean',
    category: 'Design',
    icon: Droplets,
    description: 'Résistant à l\'humidité'
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚡ PERFORMANCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    key: 'brightness_nits',
    label: 'Luminosité',
    type: 'number',
    category: 'Performance',
    icon: Sun,
    unit: 'nits',
    min: 0
  },
  {
    key: 'contrast_ratio',
    label: 'Contraste',
    type: 'text',
    category: 'Performance',
    icon: Gauge,
    placeholder: '1000:1'
  },
  {
    key: 'response_time_ms',
    label: 'Temps de réponse',
    type: 'number',
    category: 'Performance',
    icon: Clock,
    unit: 'ms',
    min: 0
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛡️ SÉCURITÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    key: 'waterproof_rating',
    label: 'Indice étanchéité',
    type: 'select',
    category: 'Sécurité',
    icon: Shield,
    options: ['IP67', 'IP68', 'IPX4', 'IPX7', 'Non étanche']
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📜 GARANTIE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    key: 'warranty_months',
    label: 'Garantie',
    type: 'number',
    category: 'Garantie',
    icon: Award,
    unit: 'mois',
    min: 0,
    max: 120
  }
];

/**
 * 🔍 Récupérer un champ par sa clé
 */
export function getSpecField(key: string): SpecField | undefined {
  return TECHNICAL_SPEC_FIELDS.find(field => field.key === key);
}

/**
 * 🗂️ Récupérer tous les champs d'une catégorie
 */
export function getFieldsByCategory(category: SpecCategory): SpecField[] {
  return TECHNICAL_SPEC_FIELDS.filter(field => field.category === category);
}

/**
 * 📋 Récupérer toutes les catégories disponibles
 */
export function getAllCategories(): SpecCategory[] {
  return Array.from(new Set(TECHNICAL_SPEC_FIELDS.map(f => f.category)));
}

/**
 * 🏷️ Récupérer les tags par défaut pour un champ
 */
export function getDefaultTags(key: string): string[] {
  const field = getSpecField(key);
  return field?.defaultTags || [];
}

/**
 * ✅ Valider une valeur selon le type de champ
 */
export function validateSpecValue(key: string, value: unknown): boolean {
  const field = getSpecField(key);
  if (!field) return true;

  switch (field.type) {
    case 'number':
      const num = Number(value);
      if (isNaN(num)) return false;
      if (field.min !== undefined && num < field.min) return false;
      if (field.max !== undefined && num > field.max) return false;
      return true;
    
    case 'boolean':
      return value === 'true' || value === 'false' || typeof value === 'boolean';
    
    case 'select':
      if (typeof value !== 'string') return false;
      return field.options?.includes(value) || false;
    
    case 'tags':
      return Array.isArray(value) || typeof value === 'string';
    
    default:
      return true;
  }
}

/**
 * 🎨 Récupérer l'icône d'une catégorie
 */
export function getCategoryIcon(category: SpecCategory) {
  const field = TECHNICAL_SPEC_FIELDS.find(f => f.category === category);
  return field?.icon || Package;
}

