'use client';

export default function StaticTest() {
  return (
    <div className="p-4 bg-red-100 border border-red-300 rounded">
      <h3 className="font-bold text-red-800">Test Statique</h3>
      <p className="text-red-700">✅ Ce composant s'affiche correctement !</p>
      <p className="text-red-700">Timestamp: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
