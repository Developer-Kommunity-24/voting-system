import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Send } from 'lucide-react';

interface RatingScreenProps {
  stallData: { id: number; name: string; description: string; logo: string | null };
  onBack?: () => void;
  onProgress?: () => void;
  onSubmitSuccess?: (rating: number) => void;
  ratedCount?: number;
  totalCount?: number;
}

export default function RatingScreen({ stallData, onBack, onSubmitSuccess }: RatingScreenProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedRating !== null) {
      setIsSubmitted(true);
      setTimeout(() => {
        onSubmitSuccess?.(selectedRating);
      }, 1500);
    }
  };

  const ratings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#070014] touch-pan-y">
      <div
        className="min-h-full w-full bg-cover bg-center bg-no-repeat relative flex flex-col font-sans text-white"
        style={{ backgroundImage: 'url("/bg.webp")' }}
      >
        {/* Dark gradient overlay for readability if the image is too bright */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/10 overflow-visible relative">
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={onBack}
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
            <img src="/Fiza_logo.webp" alt="Fiza" className="h-42 sm:h-50 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] translate-x-2 -translate-y-17 sm:translate-x-4 sm:-translate-y-16" />
          </div>
        </header>

        <main className="flex-1 w-full max-w-lg mx-auto flex flex-col px-6 pt-2 pb-32 relative z-20">
          {/* CURRENT STALL */}
          <div className="flex items-center gap-4 justify-center mb-3 mt-4">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-blue-400/60" />
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-blue-100/90 shadow-blue-500 max-w-min text-center whitespace-nowrap">Current Stall</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-blue-400/60" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-display text-center tracking-tight bg-gradient-to-r from-rose-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent mb-8 pb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {stallData.name}
          </h2>

          {/* Glassmorphism Rating Box */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Inner subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />

            {/* Trophy Info */}
            <div className="flex items-start gap-4 mb-5 relative z-10">
              <span className="text-xl sm:text-2xl leading-none pt-0.5 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">🏆</span>
              <div className="flex flex-col gap-1">
                <p className="text-white/90 text-sm font-medium leading-snug">
                  You are voting for the People's Choice Award.
                </p>
                <p className="text-white/60 text-xs">
                  Please rate this Startup on a scale of 0–10.
                </p>
              </div>
            </div>

            {/* Warning Badge */}
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3 mb-6 relative z-10">
              <span className="text-amber-400 text-base leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] pt-0.5">⚠️</span>
              <p className="text-white/70 text-[13px] font-medium leading-relaxed">
                Your votes will be counted only if you rate  <span className="text-white font-bold">all 12 stalls</span>.
              </p>
            </div>

            {/* Ratings Scroll Row */}
            <div className="flex overflow-x-auto gap-2.5 pb-2 pt-1 -mx-2 px-2 scrollbar-hide snap-x snap-mandatory">
              {ratings.map((rating) => {
                const isSelected = selectedRating === rating;
                return (
                  <motion.button
                    key={rating}
                    disabled={isSubmitted}
                    whileHover={!isSubmitted ? { scale: 1.05 } : {}}
                    whileTap={!isSubmitted ? { scale: 0.95 } : {}}
                    onClick={() => setSelectedRating(rating)}
                    className={`
                      snap-center shrink-0 w-[52px] h-[52px] rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300
                      ${isSelected
                        ? 'bg-gradient-to-br from-fuchsia-500 to-blue-600 border border-white text-white shadow-[0_0_20px_rgba(192,38,211,0.6)] z-10'
                        : 'bg-white/5 border border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'}
                      ${isSubmitted && !isSelected ? 'opacity-40' : ''}
                      ${isSubmitted ? 'cursor-default' : ''}
                    `}
                  >
                    {rating}
                  </motion.button>
                );
              })}
            </div>
            <style>{`
              .scrollbar-hide::-webkit-scrollbar { display: none; }
              .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <motion.button
              disabled={selectedRating === null || isSubmitted}
              onClick={handleSubmit}
              whileHover={selectedRating !== null && !isSubmitted ? { scale: 1.02 } : {}}
              whileTap={selectedRating !== null && !isSubmitted ? { scale: 0.98 } : {}}
              className={`
                w-[280px] sm:w-[320px] py-4 rounded-full font-bold text-[13px] tracking-[0.15em] uppercase flex items-center justify-center gap-3 transition-all duration-300
                ${selectedRating !== null && !isSubmitted
                  ? 'bg-gradient-to-r from-rose-500 via-fuchsia-600 to-blue-600 text-white border border-white/40 shadow-[0_0_30px_rgba(219,39,119,0.5)]'
                  : isSubmitted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border border-emerald-300/50 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                    : 'bg-white/[0.03] border border-white/20 text-white/30 cursor-not-allowed backdrop-blur-sm'}
              `}
            >
              {isSubmitted ? 'Vote Recorded' : 'Submit Rating'}
              {!isSubmitted && <Send className="w-5 h-5 -mt-0.5 opacity-90" />}
              {isSubmitted && (
                <span className="text-lg leading-none -mt-0.5">✓</span>
              )}
            </motion.button>
          </div>

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

          {/* About this Startup */}
          <div className="mt-12 mb-4 relative">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/20 p-6 relative shadow-lg">
              <div className="flex items-center gap-4 justify-center mb-5">
                <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-white/30" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/50">About this Startup</span>
                <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-white/30" />
              </div>
              <p className="text-white/70 text-[13px] sm:text-sm leading-relaxed text-center">
                {stallData.description || "Innovating sustainable hardware for the next digital era."}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}