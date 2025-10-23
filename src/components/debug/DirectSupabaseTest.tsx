'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DirectSupabaseTest() {
  const [status, setStatus] = useState('Initialisation...');

  useEffect(() => {
    const test = async () => {
      try {
        setStatus('Test direct Supabase...');
        console.log('🔍 DirectSupabaseTest: Début du test');
        
        const { data, error } = await supabase
          .from('products')
          .select('id, name, quantity')
          .limit(3);
        
        console.log('🔍 DirectSupabaseTest: Résultat:', { data, error });
        
        if (error) {
          setStatus(`❌ Erreur Supabase: ${error.message}`);
        } else {
          setStatus(`✅ Supabase OK - ${data?.length || 0} produits trouvés`);
        }
      } catch (error) {
        console.error('🔍 DirectSupabaseTest: Erreur:', error);
        setStatus(`❌ Erreur: ${error}`);
      }
    };

    test();
  }, []);

  return (
    <div className="p-4 bg-purple-100 border border-purple-300 rounded">
      <h3 className="font-bold text-purple-800">Test Direct Supabase</h3>
      <p className="text-purple-700">{status}</p>
    </div>
  );
}
