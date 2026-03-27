import { motion } from 'motion/react';
import { QrCode, CheckCircle2, Lock } from 'lucide-react';

function cn(...classes: (string | undefined | boolean | null | Record<string, boolean>)[]) {
  return classes.filter(Boolean).map(c => {
    if (typeof c === 'object') {
      // Fix: Only filter by value without capturing the key
      return Object.entries(c!)
        .filter((entry) => entry[1])
        .map((entry) => entry[0])
        .join(' ');
    }
    return c;
  }).join(' ');
}

interface ProgressScreenProps {
  onProfile?: () => void;
  onScanNext?: () => void;
  ratings?: Record<string, number>;
  ratedStalls?: Array<{ stallId: number, stallName: string, rating: number }>;
  totalCount?: number;
  serverProgress?: number;
  allStalls?: Array<{ id: number, name: string }>;
}

export default function ProgressScreen({
  onScanNext,
  ratings = {},
  totalCount = 11,
  serverProgress = 0,
  allStalls = []
}: ProgressScreenProps) {
  // Always use the server's synced progress as the ultimate source of truth
  const localRatedCount = Object.keys(ratings).length;
  const ratedCount = serverProgress > 0 ? serverProgress : localRatedCount;

  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#070014]">
      <div
        className="min-h-full w-full bg-cover bg-center bg-no-repeat relative flex flex-col font-sans text-white"
        style={{ backgroundImage: 'url("/bg.webp")' }}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        {/* Branding - Top Corner Page Overlays */}
        <div className="absolute top-4 left-6 sm:left-8 pointer-events-none z-30">
          <img
            src="/Nitte_logo.webp"
            alt="Nitte"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </div>

        <div className="absolute top-0 right-0 pointer-events-none z-30 opacity-90">
          <img
            src="/Fiza_logo.webp"
            alt="Fiza"
            className="h-60 sm:h-80 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] translate-x-4 -translate-y-24 sm:translate-x-8 sm:-translate-y-28"
          />
        </div>

        <main className="flex-1 pt-16 sm:pt-24 pb-24 px-6 relative z-10">
          {/* Hero Section */}
          <div className="py-8">
            <div className="mb-6">
              <img src="/CostalStartupFest2026-02.webp" alt="Coastal Startup Fest" className="h-28 w-auto object-contain mx-auto" />
            </div>
            {/* Directory Section */}
            <div className="pb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3 relative z-10 mb-6">
                <span className="text-lg leading-none drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">🏆</span>
                <p className="text-white/90 text-xs font-medium leading-none">
                  You are voting for the People's Choice Award.
                </p>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold font-display text-white/90">Stall Directory</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Updates</span>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: totalCount }).map((_, index) => {
                  const stallId = index + 1;
                  const status = index < ratedCount ? 'rated' : 'locked';

                  return (
                    <motion.div
                      key={`slot-${stallId}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn(
                        "aspect-square rounded-xl flex flex-col items-center justify-center border transition-all relative overflow-hidden",
                        status === 'locked'
                          ? 'bg-white/5 border-white/5 opacity-40'
                          : 'bg-white/10 border-white/20 shadow-lg'
                      )}
                    >
                      {status === 'rated' ? (
                        <CheckCircle2 className="w-5 h-5 text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]" />
                      ) : (
                        <Lock className="w-4 h-4 text-white/20" />
                      )}

                      {status === 'rated' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-0 right-0 w-3 h-3 bg-[#00E5FF] rounded-bl-md flex items-center justify-center"
                        >
                          <div className="w-1 h-1 bg-black rounded-full" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Progress Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <span className="text-amber-400 text-sm leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">⚠️</span>
              <p className="text-white/70 text-[11px] font-medium leading-none m-0">
                Your votes will be counted only if you rate <span className="text-white font-bold">all 11 stalls</span>.
              </p>
            </motion.div>

            {/* Scan Button / Completion Action */}
            {ratedCount < totalCount ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onScanNext}
                className="w-full py-5 bg-gradient-to-r from-rose-500 via-fuchsia-600 to-blue-600 rounded-2xl text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-fuchsia-500/20 uppercase tracking-widest text-sm border border-white/20"
              >
                <QrCode className="w-5 h-5" />
                <span>Scan QR Code</span>
              </motion.button>
            ) : (
              <div
                className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-sm border border-emerald-300/30"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>All Stalls Rated!</span>
              </div>
            )}

            {/* Branding Block - Vertical stacking for better visibility */}
            <div className="mt-4 flex flex-col items-center gap-5 relative z-10">
              {/* Powered By Section */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 text-center font-display mb-3">
                  Powered By
                </span>
                <a
                  href="https://dk24.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/Consortium Logo.svg"
                    alt="DK24"
                    className="h-15 sm:h-15 w-auto object-contain"
                  />
                </a>
              </div>

              {/* In Collaboration Section */}
              <div className="flex flex-col items-center mb-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 text-center font-display mb-4">
                  In Collaboration with
                </span>
                <div className="flex items-center justify-center gap-5 sm:gap-8">
                  {[
                    {
                      id: 1,
                      src: "/cosc.webp",
                      alt: "COSC",
                      url: "https://www.linkedin.com/company/canara-students-open-source-community/",
                    },
                    {
                      id: 2,
                      src: "/sosc.webp",
                      alt: "SOSC",
                      url: "https://sosc.org.in/",
                    },
                    {
                      id: 3,
                      src: "/sceptix.webp",
                      alt: "Sceptix",
                      url: "https://www.sceptix.in/",
                    },
                  ].map((logo) => (
                    <a
                      key={logo.id}
                      href={logo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center group transition-transform hover:scale-105">
                        <img
                          src={logo.src}
                          alt={logo.alt}
                          className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                        />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}