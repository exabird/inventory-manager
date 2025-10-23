'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      const { data: products, error } = await supabase
        .from('products')
        .select('quantity');

      if (error) throw error;

      const total = products?.length || 0;
      const inStock = products?.filter(p => p.quantity >= 5).length || 0;
      const lowStock = products?.filter(p => p.quantity > 0 && p.quantity < 5).length || 0;
      const outOfStock = products?.filter(p => p.quantity === 0).length || 0;

      setStats({
        totalProducts: total,
        inStock,
        lowStock,
        outOfStock
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Vue d&apos;ensemble de votre inventaire
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Produits */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Produits
                </CardTitle>
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          {/* En Stock */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  En Stock
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.inStock}</div>
            </CardContent>
          </Card>

          {/* Stock Faible */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Stock Faible
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.lowStock}</div>
            </CardContent>
          </Card>

          {/* Rupture */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rupture
                </CardTitle>
                <BarChart3 className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.outOfStock}</div>
            </CardContent>
          </Card>
        </div>

        {/* À venir */}
        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités à venir</CardTitle>
            <CardDescription>Prochaines améliorations du dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">En développement</Badge>
                <span className="text-sm">Graphiques d'évolution du stock</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">En développement</Badge>
                <span className="text-sm">Alertes de stock personnalisées</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">En développement</Badge>
                <span className="text-sm">Historique des mouvements</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


