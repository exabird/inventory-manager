'use client';

import { useState, useEffect } from 'react';

export default function SimpleTest() {
  const [status, setStatus] = useState('Initialisation...');

  useEffect(() => {
    const test = async () => {
      try {
        setStatus('Test de l\'API...');
        console.log('🔍 SimpleTest: Début du test API');
        
        const response = await fetch('/api/test-supabase');
        console.log('🔍 SimpleTest: Réponse reçue:', response.status);
        
        const data = await response.json();
        console.log('🔍 SimpleTest: Données:', data);
        
        if (data.success) {
          setStatus(`✅ API OK - ${data.count} produits trouvés`);
        } else {
          setStatus('❌ API Error');
        }
      } catch (error) {
        console.error('🔍 SimpleTest: Erreur:', error);
        setStatus(`❌ Erreur: ${error}`);
      }
    };

    test();
  }, []);

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded">
      <h3 className="font-bold text-blue-800">Test Simple</h3>
      <p className="text-blue-700">{status}</p>
    </div>
  );
}
