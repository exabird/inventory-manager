'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Composant toggle stylé pour basculer entre dark mode et light mode
 * Design avec animation fluide et icônes interactives
 * 
 * @param className - Classes CSS additionnelles
 * @param showLabel - Afficher le label "Thème" (défaut: true)
 */
export function ThemeToggle({ className, showLabel = true }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Éviter les erreurs d'hydratation
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn('flex items-center justify-between gap-3 h-12 px-3', className)}>
        {showLabel && <span className="text-sm font-medium">Thème</span>}
        <div className="w-14 h-7 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    const newTheme = isDark ? 'light' : 'dark';
    console.log('🎨 [ThemeToggle] Basculement thème:', theme, '→', newTheme);
    setTheme(newTheme);
  };

  return (
    <div className={cn('flex items-center justify-between gap-3 h-12 px-3', className)}>
      {showLabel && (
        <span className="text-sm font-medium text-foreground">Thème</span>
      )}
      
      {/* Toggle Switch Stylé */}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isDark ? 'bg-primary' : 'bg-muted'
        )}
      >
        {/* Track Background avec dégradé */}
        <span className="sr-only">Toggle theme</span>
        
        {/* Icône Soleil (visible en light mode) */}
        <Sun
          className={cn(
            'absolute left-1.5 h-4 w-4 text-yellow-500 transition-all duration-300',
            isDark ? 'opacity-0 scale-0 rotate-180' : 'opacity-100 scale-100 rotate-0'
          )}
        />
        
        {/* Icône Lune (visible en dark mode) */}
        <Moon
          className={cn(
            'absolute right-1.5 h-4 w-4 text-blue-300 transition-all duration-300',
            isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-180'
          )}
        />
        
        {/* Thumb (cercle qui bouge) */}
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out',
            isDark ? 'translate-x-7' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

/**
 * Version compacte du toggle pour mobile
 */
export function ThemeToggleCompact({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors text-muted-foreground',
          className
        )}
        disabled
      >
        <div className="w-10 h-5 bg-muted rounded-full animate-pulse" />
        <span className="text-xs font-medium">Thème</span>
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    const newTheme = isDark ? 'light' : 'dark';
    console.log('🎨 [ThemeToggleCompact] Basculement thème:', theme, '→', newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
        className
      )}
    >
      {/* Mini Toggle Switch */}
      <div
        className={cn(
          'relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300',
          isDark ? 'bg-primary' : 'bg-muted'
        )}
      >
        {/* Icônes dans le track */}
        <Sun
          className={cn(
            'absolute left-1 h-3 w-3 text-yellow-500 transition-all duration-300',
            isDark ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
          )}
        />
        <Moon
          className={cn(
            'absolute right-1 h-3 w-3 text-blue-300 transition-all duration-300',
            isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          )}
        />
        
        {/* Thumb */}
        <span
          className={cn(
            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-300',
            isDark ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </div>
      
      <span className="text-xs font-medium text-foreground">Thème</span>
    </button>
  );
}
