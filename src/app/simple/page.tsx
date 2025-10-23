'use client';

import { useState } from 'react';

export default function SimplePage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Page Simple (Sans Produits)</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="mb-4">Cette page ne charge pas de produits et ne devrait pas avoir de problèmes.</p>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Compteur: {count}
          </button>
          <p className="text-gray-600">Si vous voyez ceci, React fonctionne correctement !</p>
        </div>
      </div>
    </div>
  );
}

