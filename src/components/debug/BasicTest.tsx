'use client';

import { useState, useEffect } from 'react';

export default function BasicTest() {
  const [status, setStatus] = useState('Initialisation...');

  useEffect(() => {
    const test = async () => {
      try {
        setStatus('Test basique...');
        console.log('🔍 BasicTest: Début du test');
        
        // Test simple sans Supabase
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus('✅ Test basique réussi !');
        console.log('🔍 BasicTest: Test terminé');
      } catch (error) {
        console.warn('⚠️ BasicTest: Erreur:', error);
        setStatus(`❌ Erreur: ${error}`);
      }
    };

    test();
  }, []);

  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded">
      <h3 className="font-bold text-green-800">Test Basique</h3>
      <p className="text-green-700">{status}</p>
    </div>
  );
}

