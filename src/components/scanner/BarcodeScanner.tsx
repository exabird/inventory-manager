'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer la liste des caméras disponibles
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Préférer la caméra arrière sur mobile
          const backCamera = devices.find((device) =>
            device.label.toLowerCase().includes('back')
          );
          setSelectedCamera(backCamera?.id || devices[0].id);
        } else {
          setError('Aucune caméra détectée sur votre appareil.');
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        setError('Impossible d\'accéder à la caméra.');
      });

    return () => {
      // Nettoyer le scanner lors du démontage
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) {
      setError('Veuillez sélectionner une caméra.');
      return;
    }

    try {
      setError(null);
      setIsScanning(true);

      const html5QrCode = new Html5Qrcode('reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCamera,
        {
          fps: 10, // Frames par seconde
          qrbox: { width: 250, height: 250 }, // Zone de scan
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Succès du scan
          console.log('Code scanné:', decodedText);
          stopScanning();
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Erreur de scan (normal si rien n'est détecté)
          // Ne pas afficher car trop verbeux
        }
      );
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(`Erreur lors du démarrage du scanner: ${err.message || 'Erreur inconnue'}`);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold">
            Scanner un code
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Zone de scan */}
      <div className="flex flex-col items-center justify-center h-full">
        {error && (
          <Alert variant="destructive" className="mx-4 mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          id="reader"
          className={`w-full max-w-md ${isScanning ? '' : 'hidden'}`}
        ></div>

        {!isScanning && !error && (
          <div className="text-center px-6">
            <div className="mb-6">
              <Camera className="h-24 w-24 text-white/50 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">
                Prêt à scanner
              </p>
              <p className="text-white/70 text-sm">
                Pointez votre caméra vers un code-barres ou QR code
              </p>
            </div>

            {cameras.length > 1 && (
              <div className="mb-4">
                <select
                  value={selectedCamera || ''}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2 w-full max-w-xs"
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id} className="text-black">
                      {camera.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              onClick={startScanning}
              size="lg"
              className="bg-white text-black hover:bg-white/90"
            >
              <Camera className="h-5 w-5 mr-2" />
              Démarrer le scan
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <div className="flex items-center justify-center text-white">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              <span>Recherche de code...</span>
            </div>
            <Button
              onClick={stopScanning}
              variant="outline"
              className="mt-4 bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Arrêter le scan
            </Button>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!isScanning && !error && (
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
            <p className="font-semibold mb-2">💡 Conseils :</p>
            <ul className="space-y-1 text-white/80">
              <li>• Assurez-vous d'avoir un bon éclairage</li>
              <li>• Tenez votre appareil stable</li>
              <li>• Cadrez le code dans la zone de scan</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

