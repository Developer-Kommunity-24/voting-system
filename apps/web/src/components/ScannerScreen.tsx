import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { QrCode, X, Zap, ChevronLeft } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import Footer from "./Footer";

interface ScannerScreenProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function ScannerScreen({ onScanSuccess, onClose }: ScannerScreenProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isUnmounted = false;
    let html5QrCode: Html5Qrcode | null = null;

    // Slight delay to ensure DOM is ready and avoid strict-mode double mount race
    const timer = setTimeout(async () => {
      if (isUnmounted) return;

      try {
        html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            if (isUnmounted) return;
            // Success
            setIsScanning(false);
            if (html5QrCode && html5QrCode.isScanning) {
              html5QrCode.stop().then(() => {
                onScanSuccess(decodedText);
              }).catch((err: unknown) => {
                console.error("Failed to stop scanner", err);
                onScanSuccess(decodedText);
              });
            } else {
              onScanSuccess(decodedText);
            }
          },
          () => {
            // parse error, ignore it.
          }
        );

        // In case it unmounted while initializing
        if (isUnmounted && html5QrCode.isScanning) {
          html5QrCode.stop().catch(console.error);
        }
      } catch (err) {
        if (!isUnmounted) {
          console.error("Unable to start scanning", err);
          setError("Camera access denied or not available. Please ensure you have granted camera permissions.");
        }
      }
    }, 100);

    return () => {
      isUnmounted = true;
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((err: unknown) => console.error("Cleanup stop failed", err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="min-h-[100dvh] bg-black relative flex flex-col overflow-y-auto text-white">
      {/* Screen-Height Scanner Area */}
      <div className="h-[100dvh] relative flex flex-col shrink-0">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-50">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Auto Flash</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* Scanner Viewfinder */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Camera Feed Container */}
          <div className="absolute inset-0 bg-slate-900 overflow-hidden">
            <div
              id="reader"
              className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full"
            ></div>
            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-slate-900 z-30">
                <div className="max-w-xs">
                  <X className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <p className="text-white/80 text-sm mb-6">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-white/10 rounded-full border border-white/20 text-sm font-bold"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scanning Area Overlay */}
          <div className="relative w-64 h-64 z-20 pointer-events-none">
            {/* Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />

            {/* Scanning Line */}
            {isScanning && !error && (
              <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10"
              />
            )}

            {/* QR Code Placeholder (only if not scanning yet or error) */}
            {!error && isScanning && (
              <div className="absolute inset-4 flex items-center justify-center opacity-20">
                <QrCode className="w-full h-full text-white" />
              </div>
            )}
          </div>

          <div className="mt-12 text-center px-8 z-20 relative">
            <h2 className="text-xl font-bold mb-2 drop-shadow-lg">Scan Stall QR Code</h2>
            <p className="text-white/80 text-sm drop-shadow-md">Align the QR code within the frame to start rating the stall.</p>
          </div>
        </div>
      </div>

      {/* Footer Below Fold */}
      <div className="mt-auto">
        <Footer className="pb-[7rem]" />
      </div>

      {/* Success Overlay */}
      {!isScanning && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-emerald-500 flex items-center justify-center z-[100]"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold">Stall Identified!</h3>
            <p className="opacity-80">Redirecting to rating page...</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
