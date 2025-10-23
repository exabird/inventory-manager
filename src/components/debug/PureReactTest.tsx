'use client';

import { useState, useEffect } from 'react';

export default function PureReactTest() {
  const [status, setStatus] = useState('Initialisation...');

  useEffect(() => {
    const test = async () => {
      try {
        setStatus('Test React pur...');
        console.log('🔍 PureReactTest: Début du test');
        
        // Test simple sans imports externes
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setStatus('✅ React pur fonctionne !');
        console.log('🔍 PureReactTest: Test terminé');
      } catch (error) {
        console.warn('⚠️ PureReactTest: Erreur:', error);
        setStatus(`❌ Erreur: ${error}`);
      }
    };

    test();
  }, []);

  return (
    <div className="p-4 bg-orange-100 border border-orange-300 rounded">
      <h3 className="font-bold text-orange-800">Test React Pur</h3>
      <p className="text-orange-700">{status}</p>
    </div>
  );
}

