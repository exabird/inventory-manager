'use client';

import { useState } from 'react';

export default function ButtonTest() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div className="p-4 bg-pink-100 border border-pink-300 rounded">
      <h3 className="font-bold text-pink-800">Test Bouton</h3>
      <p className="text-pink-700">Compteur: {count}</p>
      <button 
        onClick={handleClick}
        className="mt-2 px-3 py-1 bg-pink-600 text-white rounded hover:bg-pink-700"
      >
        Cliquer (+1)
      </button>
    </div>
  );
}
