/**
 * Constantes de style glassmorphism réutilisables
 * 
 * Permet d'avoir un effet de verre uniforme dans toute l'application
 * et de le modifier globalement en un seul endroit.
 * 
 * @example
 * import { GLASS_STYLES } from '@/lib/glassmorphism';
 * 
 * <div className={GLASS_STYLES.stickyTop}>
 *   Header avec effet glassmorphism
 * </div>
 */

export const GLASS_STYLES = {
  /**
   * Effet glassmorphism de base
   * - bg-background/95 : Fond avec 95% d'opacité pour effet glassmorphism fort
   * - backdrop-blur-2xl : Flou fort (24px) pour effet de verre
   * - supports-[backdrop-filter]:bg-background/80 : Opacité réduite si backdrop-filter supporté
   */
  base: "bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80",
  
  /**
   * Bordure subtile pour effet glassmorphism
   */
  border: "border-border/40",
  
  /**
   * Header sticky en haut avec glassmorphism
   * Utilisé pour: Header de recherche, filtres
   */
  stickyTop: "sticky top-0 z-30 bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80 border-b border-border/40",
  
  /**
   * Footer sticky en bas avec glassmorphism
   * Utilisé pour: Ligne de total, pagination
   */
  stickyBottom: "sticky bottom-0 z-30 bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80 border-t border-border/40",
  
  /**
   * Ligne d'entêtes de colonnes avec glassmorphism
   * Position spécifique pour être sous le header
   */
  columnHeader: "sticky top-[69px] z-20 bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80 border-b border-border/40",
  
  /**
   * Modal ou dialog avec glassmorphism
   */
  modal: "bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80 border border-border/40",
  
  /**
   * Card avec effet glassmorphism léger
   */
  card: "bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 border border-border/40"
} as const;

/**
 * Helper pour créer un sticky glassmorphism avec top personnalisé
 * 
 * @param topValue - Valeur CSS pour la propriété top (ex: "69px", "100px")
 * @param zIndex - Index z optionnel (défaut: 10)
 * @returns Classes Tailwind pour l'effet
 * 
 * @example
 * const glassTop = createGlassSticky("100px", 15);
 * <div className={glassTop}>...</div>
 */
export function createGlassSticky(topValue: string, zIndex: number = 10): string {
  return `sticky top-[${topValue}] z-[${zIndex}] bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80 border-b border-border/40`;
}

/**
 * Variation d'opacité pour l'effet glassmorphism
 * Permet d'ajuster l'intensité de l'effet
 */
export const GLASS_OPACITY = {
  light: "bg-background/80 backdrop-blur-xl",      // Léger (80%)
  medium: "bg-background/90 backdrop-blur-xl",     // Moyen (90%)
  strong: "bg-background/95 backdrop-blur-2xl",    // Fort (95%) - Défaut
  full: "bg-background backdrop-blur-3xl"          // Très fort (100%)
} as const;

