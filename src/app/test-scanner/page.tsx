'use client';

import { useState } from 'react';
import { Camera, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';

export default function TestScannerPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([]);

  const handleScanSuccess = (code: string) => {
    console.log('✅ Code scanné avec succès:', code);
    setScannedCode(code);
    setScanHistory(prev => [code, ...prev].slice(0, 10));
    setShowScanner(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Test du Scanner</h1>
          <p className="text-muted-foreground mt-2">
            Testez le scanner de codes-barres et QR codes
          </p>
        </div>

        {/* Résultat actuel */}
        <Card>
          <CardHeader>
            <CardTitle>Dernier code scanné</CardTitle>
            <CardDescription>
              Le code sera affiché ici après le scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scannedCode ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-mono text-lg font-bold text-green-900">
                    {scannedCode}
                  </p>
                  <p className="text-xs text-green-700">
                    {scannedCode.length === 12 && 'UPC-A (12 chiffres)'}
                    {scannedCode.length === 13 && 'EAN-13 (13 chiffres)'}
                    {scannedCode.length === 8 && 'EAN-8 (8 chiffres)'}
                    {![8, 12, 13].includes(scannedCode.length) && `Code personnalisé (${scannedCode.length} caractères)`}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Aucun code scanné pour le moment
              </p>
            )}
          </CardContent>
        </Card>

        {/* Bouton pour ouvrir le scanner */}
        <Card>
          <CardHeader>
            <CardTitle>Scanner un code</CardTitle>
            <CardDescription>
              Cliquez sur le bouton pour ouvrir le scanner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowScanner(true)}
              className="w-full gap-2"
              size="lg"
            >
              <Camera className="h-5 w-5" />
              Ouvrir le scanner
            </Button>
          </CardContent>
        </Card>

        {/* Historique */}
        {scanHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historique des scans</CardTitle>
              <CardDescription>
                Les 10 derniers codes scannés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scanHistory.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="font-mono text-sm">{code}</span>
                    <span className="text-xs text-muted-foreground">
                      #{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations techniques */}
        <Card>
          <CardHeader>
            <CardTitle>Informations techniques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bibliothèque :</span>
              <span className="font-medium">html5-qrcode v2.3.8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Protocole :</span>
              <span className="font-medium">{typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Support caméra :</span>
              <span className="font-medium">
                {typeof navigator !== 'undefined' && navigator.mediaDevices ? '✅ Oui' : '❌ Non'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanner */}
      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

