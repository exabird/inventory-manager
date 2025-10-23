'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [detectedCodes, setDetectedCodes] = useState<string[]>([]);
  const [showCodeSelection, setShowCodeSelection] = useState(false);
  const [showCameraSelection, setShowCameraSelection] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [flashSupported, setFlashSupported] = useState(false);
  
  // Générer un ID unique CONSTANT pour éviter les conflits
  const scannerIdRef = useRef(`scanner-${Math.random().toString(36).substr(2, 9)}`);
  const scannerId = scannerIdRef.current;

  // Nettoyer le scanner au démontage du composant
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2) { // SCANNING
            scannerRef.current.stop().catch(console.error);
          }
          scannerRef.current.clear();
        } catch (err) {
          console.error('❌ [BarcodeScanner.cleanup] Erreur:', err);
        }
      }
    };
  }, []);

  // Fonction pour choisir le meilleur code-barres
  const selectBestBarcode = (codes: string[]): string => {
    console.log('📊 Codes détectés:', codes);
    
    // Priorité 1 : Codes UPC-A (12 chiffres) - Standard mondial (USA, Canada, etc.)
    const upcCodes = codes.filter(code => /^\d{12}$/.test(code));
    if (upcCodes.length > 0) {
      console.log('✅ Code UPC-A sélectionné:', upcCodes[0]);
      return upcCodes[0];
    }

    // Priorité 2 : Codes EAN-13 (13 chiffres) commençant par 0 (souvent des UPC)
    const ean13WithZero = codes.filter(code => /^0\d{12}$/.test(code));
    if (ean13WithZero.length > 0) {
      console.log('✅ Code EAN-13 (UPC format) sélectionné:', ean13WithZero[0]);
      return ean13WithZero[0];
    }

    // Priorité 3 : Autres codes EAN-13 (13 chiffres)
    const ean13Codes = codes.filter(code => /^\d{13}$/.test(code));
    if (ean13Codes.length > 0) {
      console.log('✅ Code EAN-13 sélectionné:', ean13Codes[0]);
      return ean13Codes[0];
    }

    // Priorité 4 : Codes EAN-8 (8 chiffres)
    const ean8Codes = codes.filter(code => /^\d{8}$/.test(code));
    if (ean8Codes.length > 0) {
      console.log('✅ Code EAN-8 sélectionné:', ean8Codes[0]);
      return ean8Codes[0];
    }

    // Priorité 5 : EXCLURE les numéros de série (trop longs ou avec lettres)
    // Les numéros de série ont souvent plus de 13 chiffres ou contiennent des lettres
    const standardCodes = codes.filter(code => 
      /^\d{8,13}$/.test(code) // Seulement les codes entre 8 et 13 chiffres
    );
    if (standardCodes.length > 0) {
      console.log('✅ Code standard sélectionné:', standardCodes[0]);
      return standardCodes[0];
    }

    // En dernier recours, prendre le premier code
    console.log('⚠️ Aucun code standard, utilisation du premier:', codes[0]);
    return codes[0];
  };

  const stopScanning = async () => {
    // Désactiver le flash si activé
    if (flashEnabled && videoTrackRef.current) {
      try {
        await videoTrackRef.current.applyConstraints({
          advanced: [{ torch: false } as any]
        });
        setFlashEnabled(false);
        console.log('💡 [BarcodeScanner] Flash désactivé');
      } catch (err) {
        console.warn('⚠️ [BarcodeScanner] Impossible de désactiver le flash:', err);
      }
    }

    if (!scannerRef.current) {
      console.log('🔍 [BarcodeScanner] Pas de scanner à arrêter');
      return;
    }

    try {
      // Vérifier l'état avant d'arrêter
      const state = await scannerRef.current.getState();
      console.log('🔍 [BarcodeScanner] État du scanner:', state);
      
      // Scanner states: NOT_STARTED = 1, SCANNING = 2, PAUSED = 3
      if (state === 2) { // SCANNING
        console.log('🛑 [BarcodeScanner] Arrêt du scanner en cours...');
        await scannerRef.current.stop();
        console.log('✅ [BarcodeScanner] Scanner arrêté');
      } else {
        console.log('⚠️ [BarcodeScanner] Scanner déjà arrêté ou non démarré (état:', state, ')');
      }
      
      setIsScanning(false);
    } catch (err) {
      console.error('❌ [BarcodeScanner] Erreur lors de l\'arrêt du scanner:', err);
      // Forcer l'état à false même en cas d'erreur
      setIsScanning(false);
    }
  };

  const startScanningWithCamera = async (cameraId: string) => {
    try {
      setError(null);
      setDetectedCodes([]);

      // Arrêter et nettoyer le scanner existant
      if (scannerRef.current) {
        try {
          const state = await scannerRef.current.getState();
          if (state === 2) { // SCANNING
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch (err) {
          console.warn('⚠️ Erreur lors du nettoyage du scanner existant:', err);
        }
      }

      // Vérifier que l'élément DOM existe
      const element = document.getElementById(scannerId);
      if (!element) {
        throw new Error(`Element scanner avec ID "${scannerId}" non trouvé dans le DOM`);
      }

      console.log('✅ Element scanner trouvé:', scannerId);

      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;
      
      setIsScanning(true);

      // Détecter iPhone pour optimisations spécifiques
      const isIPhone = /iPhone/.test(navigator.userAgent);
      console.log('📱 [BarcodeScanner] iPhone détecté:', isIPhone);

      const config = {
        fps: 10,  // FPS RÉDUIT = plus de temps pour décoder chaque frame
        qrbox: function(viewfinderWidth: number, viewfinderHeight: number) {
          // Zone MAXIMALE (98%x70%) pour scan à distance optimale
          const width = Math.floor(viewfinderWidth * 0.98);
          const height = Math.floor(viewfinderHeight * 0.7);
          console.log('📐 [BarcodeScanner] Zone de scan:', width, 'x', height);
          return { width, height };
        },
        disableFlip: true,  // Désactiver flip pour gain de perf
        // Configuration vidéo optimisée - contraintes souples pour compatibilité
        videoConstraints: {
          facingMode: 'environment',
          width: { ideal: 1920 },       // Full HD (plus compatible)
          height: { ideal: 1080 },      // Full HD (plus compatible)
          aspectRatio: { ideal: 16/9 }
        },
        // Formats supportés (tous les codes-barres standards)
        formatsToSupport: [
          0,  // QR_CODE
          5,  // CODE_128
          6,  // CODE_39
          7,  // CODE_93
          8,  // EAN_13
          9,  // EAN_8
          13, // UPC_A
          14, // UPC_E
          15, // UPC_EAN_EXTENSION
        ]
      };

      console.log('🔄 Démarrage du scanner avec caméra:', cameraId);

      await html5QrCode.start(
        cameraId,
        config,
        async (decodedText) => {
          // Empêcher le traitement si déjà en cours ou composant démonté
          if (isProcessingRef.current || !isMountedRef.current) {
            console.log('⏭️ [BarcodeScanner] Détection ignorée (déjà en traitement ou démonté)');
            return;
          }
          
          isProcessingRef.current = true;
          
          try {
            console.log('📦 [BarcodeScanner] Code détecté:', decodedText);
            
            // Vérifier que le code n'est pas vide
            if (!decodedText || decodedText.trim() === '') {
              console.warn('⚠️ [BarcodeScanner] Code vide ignoré');
              isProcessingRef.current = false;
              return;
            }
            
            // Arrêter immédiatement le scanner
            console.log('🛑 [BarcodeScanner] Arrêt du scanner...');
            await stopScanning();
            
            // Vérifier à nouveau si le composant est toujours monté
            if (!isMountedRef.current) {
              console.log('⚠️ [BarcodeScanner] Composant démonté, abandon');
              return;
            }
            
            // Afficher le feedback de succès
            console.log('✅ [BarcodeScanner] Succès - affichage feedback');
            setScanSuccess(true);
            
            // Attendre un court instant pour le feedback visuel
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Vérifier encore une fois avant de transmettre
            if (!isMountedRef.current) {
              console.log('⚠️ [BarcodeScanner] Composant démonté avant transmission');
              return;
            }
            
            console.log('📤 [BarcodeScanner] Transmission du code:', decodedText);
            onScanSuccess(decodedText);
            
            // Fermer seulement si toujours monté
            if (isMountedRef.current) {
              console.log('🔒 [BarcodeScanner] Fermeture du scanner');
              onClose();
            }
            
          } catch (error) {
            console.error('❌ [BarcodeScanner] Erreur lors du traitement:', error);
            
            // Tenter de nettoyer même en cas d'erreur
            try {
              await stopScanning();
            } catch (err) {
              console.error('❌ Erreur stopScanning:', err);
            }
            
            // Ne transmettre que si le composant est encore monté
            if (isMountedRef.current) {
              onScanSuccess(decodedText);
              onClose();
            }
          } finally {
            isProcessingRef.current = false;
          }
        },
        (errorMessage) => {
          // Erreur de scan (normal si rien n'est détecté)
          // On ne log pas pour éviter de polluer la console
        }
      );
    } catch (err: unknown) {
      console.error('❌ Erreur starting scanner:', err);
      console.error('❌ Type:', typeof err);
      console.error('❌ Détails:', err);
      
      let errorMessage = 'Erreur inconnue';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        console.error('❌ Message:', err.message);
        console.error('❌ Stack:', err.stack);
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String((err as any).message);
      }
      
      // Messages d'erreur plus clairs
      if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
        errorMessage = 'Accès à la caméra refusé. Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.';
      } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('not found')) {
        errorMessage = 'Aucune caméra trouvée sur votre appareil.';
      } else if (errorMessage.includes('NotReadableError')) {
        errorMessage = 'La caméra est déjà utilisée par une autre application.';
      }
      
      setError(`Erreur : ${errorMessage}`);
      setIsScanning(false);
      setShowManualInput(true);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Attendre que le composant soit complètement monté
    const initializeScanner = async () => {
      try {
        // Attendre un court instant que React finisse de rendre
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return;
        
        // Vérifier que l'élément existe
        const element = document.getElementById(scannerId);
        
        if (!element) {
          console.error('❌ Element DOM non trouvé:', scannerId);
          console.error('❌ Éléments dans le DOM:', document.querySelectorAll('[id^="scanner-"]'));
          setError('Erreur d\'initialisation du scanner. Veuillez réessayer.');
          setShowManualInput(true);
          return;
        }
        
        console.log('✅ Element DOM trouvé:', scannerId, element);
        
        // Vérifier si un scanner existe déjà pour éviter les doublons
        if (scannerRef.current) {
          console.log('⚠️ Scanner déjà initialisé, nettoyage...');
          try {
            const state = await scannerRef.current.getState();
            if (state === 2) { // SCANNING
              await scannerRef.current.stop();
            }
            scannerRef.current.clear();
          } catch (err) {
            console.warn('Erreur lors du nettoyage du scanner:', err);
          }
        }
        
        const devices = await Html5Qrcode.getCameras();
        
        if (devices && devices.length) {
          setCameras(devices);
          
          // Debug: Afficher toutes les caméras disponibles
          console.log('📷 Caméras disponibles:', devices.map(d => ({ id: d.id, label: d.label })));
          
          // Détecter si on est sur iPhone
          const isIPhone = /iPhone/.test(navigator.userAgent);
          console.log('📱 iPhone détecté:', isIPhone);
          
          // Priorité 1: Caméra ultra grand angle arrière (iPhone Pro)
          const ultraWideBackCamera = devices.find((device) => {
            const label = device.label.toLowerCase();
            // Sur iPhone: "Back Ultra Wide Camera" ou patterns similaires
            return (label.includes('ultra') && (label.includes('back') || label.includes('rear'))) ||
                   (label.includes('ultra wide') && label.includes('back')) ||
                   (label.includes('0.5') && label.includes('back')) || // iPhone nomme parfois par facteur zoom
                   (label.includes('ultra') && label.includes('environment')) ||
                   (label.includes('ultra') && !label.includes('front') && !label.includes('face') && !label.includes('avant'));
          });
          
          // Priorité 2: Caméra grand angle arrière (caméra principale iPhone)
          const wideBackCamera = devices.find((device) => {
            const label = device.label.toLowerCase();
            return (label.includes('wide') && label.includes('back')) ||
                   (label.includes('1x') && label.includes('back')) || // iPhone nomme parfois par facteur zoom
                   (label.includes('back') && !label.includes('ultra') && !label.includes('telephoto'));
          });
          
          // Priorité 3: N'importe quelle caméra arrière - EXCLURE front/avant
          const backCamera = devices.find((device) => {
            const label = device.label.toLowerCase();
            return (label.includes('back') || label.includes('rear') || label.includes('environment')) && 
                   !label.includes('front') && !label.includes('face') && !label.includes('avant');
          });
          
          const bestCamera = ultraWideBackCamera?.id || 
            wideBackCamera?.id ||
            backCamera?.id || 
            devices[devices.length - 1]?.id; // Dernière caméra souvent = arrière
          
          // Debug: Afficher la caméra sélectionnée
          const selectedCameraInfo = devices.find(d => d.id === bestCamera);
          console.log('✅ Caméra sélectionnée:', selectedCameraInfo?.label);
          console.log('✅ ID:', selectedCameraInfo?.id);
          
          setSelectedCamera(bestCamera);
          
          // Démarrer le scanner immédiatement
          console.log('🚀 Lancement du scanner...');
          await startScanningWithCamera(bestCamera);
          
        } else {
          setError('Aucune caméra détectée sur votre appareil.');
          setShowManualInput(true);
        }
      } catch (err) {
        console.error('❌ Error getting cameras:', err);
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
      isMounted = false;
      isMountedRef.current = false;
      // Nettoyer le scanner lors du démontage
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2) { // SCANNING
            scannerRef.current.stop().catch(console.error);
          }
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (err) {
          console.error('❌ [BarcodeScanner.unmount] Erreur:', err);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleCodeSelection = (selectedCode: string) => {
    try {
      console.log('📤 [BarcodeScanner] Sélection manuelle du code:', selectedCode);
      setShowCodeSelection(false);
      setDetectedCodes([]);
      onScanSuccess(selectedCode);
      onClose();
    } catch (error) {
      console.error('❌ [BarcodeScanner] Erreur lors de la sélection du code:', error);
      // En cas d'erreur, essayer quand même de transmettre le code et fermer
      onScanSuccess(selectedCode);
      onClose();
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  // Fonction pour activer/désactiver le flash
  const toggleFlash = async () => {
    try {
      // Récupérer le track vidéo du scanner
      const videoElement = document.querySelector(`#${scannerId} video`) as HTMLVideoElement;
      
      if (!videoElement || !videoElement.srcObject) {
        console.warn('⚠️ [BarcodeScanner] Impossible de trouver le stream vidéo');
        return;
      }

      const stream = videoElement.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      
      if (!track) {
        console.warn('⚠️ [BarcodeScanner] Aucun track vidéo trouvé');
        return;
      }

      videoTrackRef.current = track;

      // Vérifier les capacités
      const capabilities = track.getCapabilities() as any;
      console.log('📸 [BarcodeScanner] Capacités caméra:', capabilities);

      if (!capabilities.torch) {
        console.warn('⚠️ [BarcodeScanner] Flash non supporté sur cet appareil');
        setFlashSupported(false);
        return;
      }

      setFlashSupported(true);
      const newFlashState = !flashEnabled;

      // Activer/désactiver le flash
      await track.applyConstraints({
        advanced: [{ torch: newFlashState } as any]
      });

      setFlashEnabled(newFlashState);
      console.log(`💡 [BarcodeScanner] Flash ${newFlashState ? 'activé' : 'désactivé'}`);
      
    } catch (error) {
      console.error('❌ [BarcodeScanner] Erreur lors du toggle flash:', error);
    }
  };

  // Vérifier le support du flash au démarrage du scan
  useEffect(() => {
    if (isScanning) {
      // Attendre que le stream soit initialisé
      setTimeout(async () => {
        const videoElement = document.querySelector(`#${scannerId} video`) as HTMLVideoElement;
        if (videoElement && videoElement.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          const track = stream.getVideoTracks()[0];
          if (track) {
            const capabilities = track.getCapabilities() as any;
            if (capabilities.torch) {
              setFlashSupported(true);
              console.log('✅ [BarcodeScanner] Flash supporté !');
            }
          }
        }
      }, 1000);
    }
  }, [isScanning, scannerId]);

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
          <Alert variant="destructive" className="mx-4 mb-4 max-w-md">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Element du scanner - TOUJOURS visible dans le DOM */}
        <div className="w-full max-w-md">
          <div
            id={scannerId}
            style={{ width: '100%', maxWidth: '500px' }}
          ></div>
        </div>

        {/* Boutons de contrôle dans la vue de scan */}
        {isScanning && (
          <>
            <div className="absolute top-20 right-4 flex flex-col gap-2">
              {/* Bouton Flash */}
              {flashSupported && (
                <Button
                  onClick={toggleFlash}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "bg-white/90 hover:bg-white border-white/20",
                    flashEnabled ? "text-yellow-500 font-bold" : "text-black"
                  )}
                >
                  {flashEnabled ? '⚡ Flash ON' : '💡 Flash OFF'}
                </Button>
              )}
              
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

            {/* Indicateur de scan actif */}
            <div className="absolute top-32 left-4">
              <div className="bg-green-500/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                <span className="text-white font-semibold text-sm">Analyse en cours...</span>
              </div>
            </div>
          </>
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

        {isScanning && !scanSuccess && (
          <div className="absolute bottom-8 left-0 right-0 px-6">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="flex items-center justify-center text-white mb-3">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                <span className="font-medium">Recherche de code...</span>
              </div>
              <div className="text-white/80 text-sm space-y-1 mb-4">
                <p>📱 Tenez l'appareil stable</p>
                <p>💡 Assurez un bon éclairage</p>
                <p>🎯 Centrez le code-barres dans la zone</p>
              </div>
              <Button
                onClick={stopScanning}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Arrêter le scan
              </Button>
            </div>
          </div>
        )}

        {/* Feedback de succès */}
        {scanSuccess && (
          <div className="absolute bottom-8 left-0 right-0 px-6">
            <div className="bg-green-500 backdrop-blur-sm rounded-lg p-4 text-center animate-pulse">
              <div className="flex items-center justify-center text-white">
                <span className="text-4xl mr-3">✅</span>
                <span className="font-bold text-lg">Code détecté !</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!isScanning && !error && (
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
            <p className="font-semibold mb-2">💡 Pour scanner de loin :</p>
            <ul className="space-y-1 text-white/80">
              <li>⚡ <strong>Activez le FLASH</strong> (bouton en haut à droite)</li>
              <li>📱 Tenez votre iPhone bien stable</li>
              <li>🎯 Le code-barres doit remplir ~50% de la zone</li>
              <li>⏱️ Laissez 2-3 secondes pour la détection</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}


