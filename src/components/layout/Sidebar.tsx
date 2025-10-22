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
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Inventory Manager</h1>
          <p className="text-sm text-muted-foreground">v0.1.14</p>
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

