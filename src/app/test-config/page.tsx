'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabaseConfig() {
  const [config, setConfig] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('En cours...');

  useEffect(() => {
    const testConfig = async () => {
      try {
        // Vérifier la configuration Supabase
        const url = supabase.supabaseUrl;
        const key = supabase.supabaseKey;
        
        console.log('🔍 Configuration Supabase:');
        console.log('URL:', url);
        console.log('Key:', key ? `${key.substring(0, 20)}...` : 'Non définie');
        
        setConfig({
          url,
          keyLength: key ? key.length : 0,
          keyPreview: key ? `${key.substring(0, 20)}...` : 'Non définie'
        });

        // Test de connexion
        const { data, error } = await supabase
          .from('products')
          .select('id, name')
          .limit(1);

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          setTestResult(`Erreur: ${error.message}`);
        } else {
          console.log('✅ Connexion réussie:', data);
          setTestResult(`Succès: ${data?.length || 0} produit(s) trouvé(s)`);
        }
      } catch (err) {
        console.error('❌ Erreur générale:', err);
        setTestResult(`Erreur générale: ${err}`);
      }
    };

    testConfig();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Configuration Supabase</h1>
      
      {config && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Configuration:</h2>
          <ul className="space-y-2">
            <li><strong>URL:</strong> {config.url}</li>
            <li><strong>Clé:</strong> {config.keyPreview} (longueur: {config.keyLength})</li>
          </ul>
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Test de connexion:</h2>
        <p className="text-lg">{testResult}</p>
      </div>
    </div>
  );
}
