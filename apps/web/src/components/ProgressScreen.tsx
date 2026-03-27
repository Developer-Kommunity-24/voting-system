import { motion } from 'motion/react';
import { QrCode, CheckCircle2, Lock, Vote, BarChart3, User, ChevronLeft } from 'lucide-react';

function cn(...classes: (string | undefined | boolean | null | Record<string, boolean>)[]) {
  return classes.filter(Boolean).map(c => {
    if (typeof c === 'object') {
      return Object.entries(c!).filter(([_, v]) => v).map(([k, _]) => k).join(' ');
    }
    return c;
  }).join(' ');
}

interface ProgressScreenProps {
  onBackToVote?: () => void;
  onProfile?: () => void;
  onScanNext?: () => void;
  ratings?: Record<string, number>;
  ratedStalls?: Array<{ stallId: number, stallName: string, rating: number }>;
  totalCount?: number;
  serverProgress?: number;
}

export default function ProgressScreen({
  onBackToVote,
  onProfile,
  onScanNext,
  ratings = {},
  ratedStalls = [],
  totalCount = 13,
  serverProgress = 0
}: ProgressScreenProps) {
  // Always use the server's synced progress as the ultimate source of truth, fallback to local if 0
  const localRatedCount = Object.keys(ratings).length;
  const ratedCount = Math.max(serverProgress, localRatedCount);
  const progressPercentage = Math.round((ratedCount / totalCount) * 100);

  return (
    <div
      className="h-[100dvh] bg-[#070014] bg-cover bg-center bg-no-repeat bg-fixed relative flex flex-col font-sans text-white overflow-hidden"
      style={{ backgroundImage: 'url("/bg.webp")' }}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/10 overflow-visible relative">
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={onBackToVote}
            className="p-2 -ml-2 rounded-full transition-colors text-rose-500 hover:bg-white/10"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        </div>
        <div className="flex items-center justify-end gap-4 relative z-10 mr-24 sm:mr-36">
          <img src="/Nitte_logo.webp" alt="Nitte" className="h-8 w-auto object-contain -translate-y-1.99" />
        </div>

        {/* Absolutely positioned Fiza Logo */}
        <div className="absolute top-0 right-0 pointer-events-none opacity-90 z-20">
          <img src="/fiza2logo.webp" alt="Fiza" className="h-42 sm:h-50 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] translate-x-2 -translate-y-17 sm:translate-x-4 sm:-translate-y-16" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-6 relative z-10">
        {/* Hero Section */}
        <div className="py-8">
          <div className="mb-6">
            <img src="/CostalStartupFest2026-02.webp" alt="Coastal Startup Fest" className="h-28 w-auto object-contain mx-auto" />
          </div>

          {/* Progress Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.04] backdrop-blur-xl border border-white/20 rounded-[32px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mb-6 relative overflow-hidden"
          >
            {/* Inner subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 relative z-10">
              <div className="flex items-start gap-4">
                <span className="text-xl leading-none pt-0.5 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">🏆</span>
                <p className="text-white/90 text-sm font-medium leading-snug">
                  You are voting for the People’s Choice Award.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-amber-400 text-sm leading-none pt-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">⚠️</span>
                <p className="text-white/70 text-xs font-medium leading-relaxed">
                  Your votes will be counted only if you rate at least <span className="text-white font-bold">12 different stalls</span>.
                </p>
              </div>
            </div>
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBackToVote}
              className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-sm border border-emerald-300/30"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>All Stalls Rated!</span>
            </motion.button>
          )}

          {/* Branding Block - Vertical stacking for better visibility */}
          <div className="mt-12 flex flex-col items-center gap-5 relative z-10">
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
                <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 overflow-hidden">
                  <img
                    src="/dk24.webp"
                    alt="DK24"
                    className="w-full h-full object-contain scale-110"
                  />
                </div>
                <span className="text-2xl sm:text-3xl font-black font-display tracking-tight whitespace-nowrap bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                  DK24
                </span>
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
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all group overflow-hidden rounded-xl">
                      <img
                        src={logo.src}
                        alt={logo.alt}
                        className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity p-0.5"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Directory Section */}
        <div className="pb-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold font-display text-white/90">Stall Directory</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Updates</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: totalCount }).map((_, i) => {
              const expectedStallId = i + 1;
              const ratedStall = ratedStalls.find(s => s.stallId === expectedStallId);
              const status = ratedStall ? 'rated' : 'locked';

              return (
                <motion.div
                  key={`slot-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all relative overflow-hidden",
                    status === 'locked'
                      ? 'bg-white/5 border-white/5 opacity-40'
                      : 'bg-white/10 border-white/20 shadow-lg'
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-black mb-1",
                    status === 'rated' ? 'text-[#00E5FF]' : 'text-white/20'
                  )}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {status === 'rated' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00E5FF]" />
                  ) : (
                    <Lock className="w-4 h-4 text-white/20" />
                  )}

                  {status === 'rated' && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-[#00E5FF] rounded-bl-lg flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-black rounded-full" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
