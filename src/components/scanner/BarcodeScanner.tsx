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
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [detectedCodes, setDetectedCodes] = useState<string[]>([]);
  const [showCodeSelection, setShowCodeSelection] = useState(false);
  const [showCameraSelection, setShowCameraSelection] = useState(false);

  useEffect(() => {
    // Démarrer automatiquement le scan avec la meilleure caméra
    const initializeScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        
        if (devices && devices.length) {
          setCameras(devices);
          
          // Debug: Afficher toutes les caméras disponibles
          console.log('Caméras disponibles:', devices.map(d => d.label));
          
          // Priorité 1: Caméra ultra grand angle arrière (différentes variantes)
          const ultraWideBackCamera = devices.find((device) => {
            const label = device.label.toLowerCase();
            return (label.includes('ultra') && label.includes('back')) ||
                   (label.includes('ultra') && label.includes('rear')) ||
                   (label.includes('ultra') && label.includes('environment')) ||
                   (label.includes('ultra') && !label.includes('front'));
          });
          
          // Priorité 2: Caméra arrière normale (différentes variantes)
          const backCamera = devices.find((device) => {
            const label = device.label.toLowerCase();
            return (label.includes('back') && !label.includes('front')) ||
                   (label.includes('rear') && !label.includes('front')) ||
                   (label.includes('environment') && !label.includes('front'));
          });
          
          // Priorité 3: Caméra avec "environment" ou "rear"
          const rearCamera = devices.find((device) => {
            const label = device.label.toLowerCase();
            return label.includes('environment') || label.includes('rear');
          });
          
          const bestCamera = ultraWideBackCamera?.id || 
            backCamera?.id || 
            rearCamera?.id || 
            devices[0].id;
          
          // Debug: Afficher la caméra sélectionnée
          const selectedCameraLabel = devices.find(d => d.id === bestCamera)?.label;
          console.log('Caméra sélectionnée:', selectedCameraLabel);
          
          setSelectedCamera(bestCamera);
          
          // Démarrer automatiquement le scan
          setTimeout(() => {
            startScanningWithCamera(bestCamera);
          }, 500);
          
        } else {
          setError('Aucune caméra détectée sur votre appareil.');
          setShowManualInput(true);
        }
      } catch (err) {
        console.error('Error getting cameras:', err);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isChrome = /CriOS/.test(navigator.userAgent);
        
        if (isIOS && isChrome) {
          setError('⚠️ Chrome sur iOS ne supporte pas la caméra. Utilisez Safari ou entrez le code manuellement.');
        } else {
          setError('Impossible d\'accéder à la caméra. Vous pouvez entrer le code manuellement.');
        }
        setShowManualInput(true);
      }
    };

    initializeScanner();

    return () => {
      // Nettoyer le scanner lors du démontage
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanningWithCamera = async (cameraId: string) => {
    try {
      setError(null);
      setIsScanning(true);
      setDetectedCodes([]);

      const html5QrCode = new Html5Qrcode('reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          console.log('Code détecté:', decodedText);
          
          // Ajouter le code à la liste des codes détectés
          setDetectedCodes(prev => {
            if (!prev.includes(decodedText)) {
              const newCodes = [...prev, decodedText];
              
              // Si on a plusieurs codes, arrêter le scan et proposer la sélection
              if (newCodes.length >= 2) {
                stopScanning();
                setShowCodeSelection(true);
                return newCodes;
              }
              
              // Si c'est le premier code, continuer à scanner brièvement pour détecter d'autres codes
              setTimeout(() => {
                if (newCodes.length === 1) {
                  // Auto-sélection du meilleur code après 1 seconde
                  const bestCode = selectBestBarcode(newCodes);
                  stopScanning();
                  onScanSuccess(bestCode);
                }
              }, 1000);
              
              return newCodes;
            }
            return prev;
          });
        },
        (errorMessage) => {
          // Erreur de scan (normal si rien n'est détecté)
        }
      );
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(`Erreur lors du démarrage du scanner: ${err.message || 'Erreur inconnue'}`);
      setIsScanning(false);
      setShowManualInput(true);
    }
  };

  const startScanning = async () => {
    if (!selectedCamera) {
      setError('Veuillez sélectionner une caméra.');
      return;
    }
    await startScanningWithCamera(selectedCamera);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScanSuccess(manualInput.trim());
      onClose();
    }
  };

  // Fonction pour choisir le meilleur code-barres
  const selectBestBarcode = (codes: string[]): string => {
    // Priorité 1 : Codes UPC (12 chiffres) - Standard mondial
    const upcCodes = codes.filter(code => /^\d{12}$/.test(code));
    if (upcCodes.length > 0) {
      return upcCodes[0];
    }

    // Priorité 2 : Codes EAN-13 (13 chiffres) - Standard européen
    const ean13Codes = codes.filter(code => /^\d{13}$/.test(code));
    if (ean13Codes.length > 0) {
      return ean13Codes[0];
    }

    // Priorité 3 : Codes EAN-8 (8 chiffres) - Codes courts
    const ean8Codes = codes.filter(code => /^\d{8}$/.test(code));
    if (ean8Codes.length > 0) {
      return ean8Codes[0];
    }

    // Priorité 4 : Codes numériques longs (plus de 8 chiffres)
    const longNumericCodes = codes.filter(code => /^\d{9,}$/.test(code));
    if (longNumericCodes.length > 0) {
      return longNumericCodes[0];
    }

    // Priorité 5 : Codes numériques courts
    const numericCodes = codes.filter(code => /^\d+$/.test(code));
    if (numericCodes.length > 0) {
      return numericCodes[0];
    }

    // En dernier recours, prendre le premier code
    return codes[0];
  };

  const handleCodeSelection = (selectedCode: string) => {
    setShowCodeSelection(false);
    setDetectedCodes([]);
    onScanSuccess(selectedCode);
    onClose();
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

        {/* Boutons de contrôle dans la vue de scan */}
        {isScanning && (
          <div className="absolute top-20 right-4 flex gap-2">
            <Button
              onClick={() => {
                stopScanning();
                setShowCameraSelection(true);
              }}
              variant="outline"
              size="sm"
              className="bg-white/90 text-black hover:bg-white border-white/20"
            >
              📷 Caméra
            </Button>
            <Button
              onClick={() => {
                stopScanning();
                setShowManualInput(true);
              }}
              variant="outline"
              size="sm"
              className="bg-white/90 text-black hover:bg-white border-white/20"
            >
              📝 Manuel
            </Button>
          </div>
        )}

        {!isScanning && !error && !showCodeSelection && (
          <div className="text-center px-6">
            <div className="mb-6">
              <Camera className="h-24 w-24 text-white/50 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">
                Initialisation du scanner...
              </p>
              <p className="text-white/70 text-sm">
                Sélection automatique de la caméra ultra grand angle arrière
              </p>
            </div>

            {/* Option de saisie manuelle */}
            <div className="mt-4">
              <Button
                onClick={() => setShowManualInput(!showManualInput)}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                {showManualInput ? 'Masquer' : 'Entrer le code manuellement'}
              </Button>
            </div>
          </div>
        )}

        {/* Sélection de caméra */}
        {showCameraSelection && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Choisir la caméra
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Sélectionnez la caméra ultra grand angle arrière :
              </p>
              <div className="space-y-2">
                {cameras.map((camera) => {
                  const isSelected = selectedCamera === camera.id;
                  const isUltraWide = camera.label.toLowerCase().includes('ultra');
                  const isBack = camera.label.toLowerCase().includes('back') || 
                               camera.label.toLowerCase().includes('rear') ||
                               camera.label.toLowerCase().includes('environment');
                  
                  return (
                    <button
                      key={camera.id}
                      onClick={() => {
                        setSelectedCamera(camera.id);
                        setShowCameraSelection(false);
                        startScanningWithCamera(camera.id);
                      }}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{camera.label}</span>
                        {isUltraWide && isBack && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                            ⭐ Recommandé
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={() => setShowCameraSelection(false)}
                variant="outline"
                className="w-full mt-4"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Sélection de codes multiples */}
        {showCodeSelection && detectedCodes.length > 1 && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Plusieurs codes détectés
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Choisissez le code-barres principal du produit :
              </p>
              <div className="space-y-2">
                {detectedCodes.map((code, index) => {
                  const isRecommended = selectBestBarcode(detectedCodes) === code;
                  const codeType = code.length === 12 ? 'UPC (Recommandé)' : 
                                 code.length === 13 ? 'EAN-13' : 
                                 code.length === 8 ? 'EAN-8' : 
                                 'Autre format';
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleCodeSelection(code)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        isRecommended
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">{code}</span>
                        {isRecommended && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                            ⭐ Meilleur choix
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {codeType}
                      </div>
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={() => setShowCodeSelection(false)}
                variant="outline"
                className="w-full mt-4"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Saisie manuelle */}
        {showManualInput && !isScanning && !showCodeSelection && (
          <div className="absolute bottom-20 left-0 right-0 px-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <label className="block text-white text-sm font-semibold mb-2">
                Code-barres ou QR code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                  placeholder="Ex: 3245678901234"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder:text-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                  autoFocus
                />
                <Button
                  onClick={handleManualSubmit}
                  className="bg-white text-black hover:bg-white/90"
                  disabled={!manualInput.trim()}
                >
                  OK
                </Button>
              </div>
            </div>
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


