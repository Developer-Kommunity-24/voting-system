import { useState } from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';

interface RatingScreenProps {
  itemData: { id: number; name: string; description: string; logo: string | null };
  onSubmitSuccess?: (rating: number) => void;
  ratedCount?: number;
  totalCount?: number;
}

export default function RatingScreen({ itemData, onSubmitSuccess }: RatingScreenProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRating(parseInt(e.target.value, 10));
  };

  const getRatingColor = (val: number | null) => {
    if (val === null) return "#94a3b8";
    if (val <= 3) return "#f43f5e";
    if (val <= 7) return "#fbbf24";
    return "#22c55e";
  };

  const handleSubmit = () => {
    if (selectedRating !== null) {
      setIsSubmitted(true);
      setTimeout(() => {
        onSubmitSuccess?.(selectedRating);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#070014] touch-pan-y">
      <div
        className="min-h-full w-full bg-cover bg-center bg-no-repeat relative flex flex-col font-sans text-white"
        style={{ backgroundImage: 'url("/bg.webp")' }}
      >
        {/* Dark gradient overlay for readability if the image is too bright */}
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

        <main className="flex-1 w-full max-w-lg mx-auto flex flex-col px-6 pt-16 sm:pt-24 pb-32 relative z-20">
          {/* CURRENT ITEM */}
          <div className="flex items-center gap-4 justify-center mb-3 mt-4">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-blue-400/60" />
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-blue-100/90 shadow-blue-500 max-w-min text-center whitespace-nowrap">Current Item</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-blue-400/60" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-display text-center tracking-tight bg-gradient-to-r from-rose-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent mb-8 pb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {itemData.name}
          </h2>

          {/* Info Card */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden mb-4">
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
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3 relative z-10">
              <span className="text-amber-400 text-base leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] pt-0.5">⚠️</span>
              <p className="text-white/70 text-[13px] font-medium leading-relaxed">
                Your votes will be counted only if you rate <span className="text-white font-bold">all 11 items</span>.
              </p>
            </div>
          </div>
          <div className="relative h-28 flex flex-col justify-center px-4 mb-2">
            <div className="relative h-16 flex items-center group">

              <div className="absolute left-0 right-0 h-5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] overflow-hidden">

                <motion.div
                  className="h-full relative transition-colors duration-500"
                  style={{
                    width: `${((selectedRating ?? 0) / 10) * 100}%`,
                    backgroundColor: getRatingColor(selectedRating)
                  }}
                >
                  {/* Liquid Glow Effect */}
                  <div className="absolute top-0 right-0 h-full w-8 bg-white/30 blur-md animate-pulse" />
                </motion.div>
              </div>

              {/* Tick Marks - Enhanced */}
              <div className="absolute left-0 right-0 flex justify-between px-2 pointer-events-none">
                {[...Array(11)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-[2px] h-3 rounded-full transition-all duration-300 ${selectedRating !== null && i <= selectedRating ? 'bg-white/60 scale-y-125' : 'bg-white/10'
                      }`}
                  />
                ))}
              </div>

              {/* Native Input Range */}
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={selectedRating ?? 0}
                onChange={handleSliderChange}
                disabled={isSubmitted}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 disabled:cursor-default"
              />

              {/* Enhanced Custom Thumb - Rectangular Design */}
              <motion.div
                className="absolute w-10 h-16 bg-white rounded-xl shadow-[0_0_35px_rgba(255,255,255,0.4)] z-20 pointer-events-none flex items-center justify-center"
                style={{ border: `4px solid ${getRatingColor(selectedRating)}` }}
                animate={{
                  left: `calc(${((selectedRating ?? 0) / 10) * 100}% - 20px)`,
                  x: selectedRating === 0 ? 20 : selectedRating === 10 ? -20 : 0,
                  scale: isSubmitted ? 0.8 : 1
                }}
                whileHover={!isSubmitted ? { scale: 1.1 } : {}}
                transition={{ type: "spring", stiffness: 600, damping: 25 }}
              >
                {/* Number inside Thumb */}
                <div className="flex flex-col items-center justify-center">
                  <span className={`text-sm font-black transition-colors duration-300 ${selectedRating === null ? 'text-black/20' : 'text-black'}`}>
                    {selectedRating ?? 0}
                  </span>
                  <div
                    className="w-4 h-0.5 rounded-full mt-1 transition-colors duration-300"
                    style={{ backgroundColor: getRatingColor(selectedRating) }}
                  />
                </div>

              </motion.div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-0 flex justify-center">
            <motion.button
              disabled={selectedRating === null || isSubmitted}
              onClick={handleSubmit}
              whileHover={selectedRating !== null && !isSubmitted ? { scale: 1.02 } : {}}
              whileTap={selectedRating !== null && !isSubmitted ? { scale: 0.98 } : {}}
              className={`
                px-8 py-3.5 sm:px-12 sm:py-4 rounded-[100px] font-bold text-sm sm:text-base uppercase tracking-[0.18em] flex items-center justify-center gap-3 transition-all duration-300
                ${selectedRating !== null && !isSubmitted
                  ? `bg-white text-black shadow-2xl`
                  : isSubmitted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed backdrop-blur-sm'}
              `}
              style={{
                minWidth: "220px"
              }}
            >
              {isSubmitted ? 'Vote Recorded' : 'Submit Rating'}
              {!isSubmitted && <Send className="w-5 h-5 -mt-0.5 opacity-90" />}
              {isSubmitted && (
                <span className="text-lg leading-none -mt-0.5">✓</span>
              )}
            </motion.button>
          </div>

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

          {/* About this Startup */}
          <div className="mt-12 mb-4 relative">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/20 p-6 relative shadow-lg">
              <div className="flex items-center gap-4 justify-center mb-5">
                <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-white/30" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/50">About this Startup</span>
                <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-white/30" />
              </div>
              <p className="text-white/70 text-[13px] sm:text-sm leading-relaxed text-center">
                {itemData.description || "Innovating sustainable hardware for the next digital era."}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}