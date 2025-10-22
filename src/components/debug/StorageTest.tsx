'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';

export default function StorageTest() {
  const [testResult, setTestResult] = useState<string>('');

  const testStorageConnection = async () => {
    try {
      setTestResult('🔄 Test de connexion Supabase Storage...');
      
      // Test 1: Essayer de lister les fichiers dans le bucket (plus direct)
      const { data: files, error: filesError } = await supabase.storage
        .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
        .list('', { limit: 1 });
      
      if (filesError) {
        console.error('Erreur listage fichiers:', filesError);
        setTestResult(`❌ Erreur bucket: ${filesError.message}`);
        return;
      }
      
      setTestResult(`✅ Bucket ${STORAGE_BUCKETS.PRODUCT_IMAGES} accessible (${files?.length || 0} fichiers trouvés)`);
      
      // Test 2: Essayer un upload de test (fichier image simulé)
      const testFileName = `test-${Date.now()}.png`;
      // Créer un fichier image minimal (1x1 pixel PNG)
      const pngData = new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR data
        0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
        0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
      ]);
      
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
        .upload(`test/${testFileName}`, pngData, {
          contentType: 'image/png'
        });
      
      if (uploadError) {
        setTestResult(prev => prev + `\n⚠️ Erreur upload test: ${uploadError.message}`);
      } else {
        setTestResult(prev => prev + `\n✅ Upload test réussi`);
        
        // Nettoyer le fichier de test
        await supabase.storage
          .from(STORAGE_BUCKETS.PRODUCT_IMAGES)
          .remove([`test/${testFileName}`]);
      }
      
    } catch (error) {
      console.error('Erreur test storage:', error);
      setTestResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Test Supabase Storage</h3>
      <Button onClick={testStorageConnection} className="mb-4">
        Tester la connexion Storage
      </Button>
      {testResult && (
        <pre className="text-sm bg-white p-3 rounded border overflow-auto">
          {testResult}
        </pre>
      )}
    </div>
  );
}
