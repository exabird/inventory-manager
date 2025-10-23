'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  Package, 
  LayoutDashboard, 
  Settings, 
  BarChart3,
  Wrench 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { APP_VERSION } from '@/lib/version';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: '/dashboard'
  },
  {
    id: 'products',
    label: 'Produits',
    icon: <Package className="h-5 w-5" />,
    href: '/'
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: <BarChart3 className="h-5 w-5" />,
    href: '/reports'
  },
  {
    id: 'tools',
    label: 'Outils',
    icon: <Wrench className="h-5 w-5" />,
    href: '/tools'
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: <Settings className="h-5 w-5" />,
    href: '/settings'
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* Sidebar Desktop - Toujours visible */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:bg-card md:fixed md:inset-y-0 md:left-0">
        {/* Header avec Logo */}
        <div className="p-6 border-b">
          {/* Logo */}
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 64 64" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                {/* Fond du carton */}
                <rect x="8" y="12" width="48" height="40" rx="4" fill="hsl(var(--primary))" opacity="0.9"/>
                
                {/* Lignes de code-barres */}
                <line x1="16" y1="24" x2="16" y2="36" stroke="white" strokeWidth="2"/>
                <line x1="20" y1="24" x2="20" y2="36" stroke="white" strokeWidth="1"/>
                <line x1="23" y1="24" x2="23" y2="36" stroke="white" strokeWidth="3"/>
                <line x1="28" y1="24" x2="28" y2="36" stroke="white" strokeWidth="1"/>
                <line x1="31" y1="24" x2="31" y2="36" stroke="white" strokeWidth="2"/>
                <line x1="35" y1="24" x2="35" y2="36" stroke="white" strokeWidth="1"/>
                <line x1="38" y1="24" x2="38" y2="36" stroke="white" strokeWidth="3"/>
                <line x1="43" y1="24" x2="43" y2="36" stroke="white" strokeWidth="2"/>
                <line x1="47" y1="24" x2="47" y2="36" stroke="white" strokeWidth="1"/>
                
                {/* Badge AI */}
                <circle cx="50" cy="18" r="10" fill="hsl(var(--accent))" stroke="white" strokeWidth="2"/>
                <text x="50" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">AI</text>
              </svg>
            </div>
          </div>
          
          {/* Titre */}
          <h1 className="text-xl font-bold text-center">Inventory Manager</h1>
          <p className="text-sm text-muted-foreground text-center">v{APP_VERSION}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Button
                key={item.id}
                onClick={() => router.push(item.href)}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 h-12',
                  isActive && 'bg-secondary'
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            <p>© 2025 Inventory Manager</p>
          </div>
        </div>
      </aside>

      {/* Bottom Bar Mobile - Style App Native */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <nav className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'transition-transform',
                  isActive && 'scale-110'
                )}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Spacer pour bottom bar mobile */}
      <div className="md:hidden h-16" />
    </>
  );
}

