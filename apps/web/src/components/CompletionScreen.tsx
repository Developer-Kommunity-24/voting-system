import { motion } from 'motion/react';
import { CheckCircle2, Star } from 'lucide-react';

interface CompletionScreenProps {
  onClose: () => void;
}

export default function CompletionScreen({ 
  onClose
}: CompletionScreenProps) {
  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#070014]"
    >
      <div
        className="h-full w-full bg-cover bg-center bg-no-repeat relative flex flex-col font-sans text-white"
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

        <main className="flex-1 px-8 py-8 flex flex-col items-center justify-center gap-10 sm:gap-12 relative z-10 mx-auto w-full max-w-lg h-full">
          {/* Hero Illustration - Balanced size for no-scroll */}
          <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center shrink-0">
            {/* Background Decorative Frame */}
            <div className="absolute inset-0 border border-white/50 rounded-3xl transform rotate-3" />
            <div className="absolute inset-0 border border-white/50 rounded-3xl transform -rotate-3" />

            {/* Main Visual (Purple Card with Pattern) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
              animate={{ scale: 1, opacity: 1, rotate: 10 }}
              className="relative w-[70%] h-[70%] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-2xl shadow-2xl shadow-purple-900/40 overflow-hidden flex items-center justify-center -translate-y-4 translate-x-4"
            >
              {/* Subtle Dot Grid Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:12px_12px] opacity-10" />

              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg relative z-10">
                <Star className="w-7 h-7 text-[#6D28D9] fill-[#6D28D9]" />
              </div>
            </motion.div>

            {/* Submission Success Card Overlay */}
            <motion.div
              initial={{ x: -40, y: 40, opacity: 0 }}
              animate={{ x: -20, y: 20, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-0 bg-white shadow-2xl p-5 rounded-2xl border border-white/20 flex items-start gap-4 w-[75%] z-10"
            >
              <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-[#8B5CF6]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6] block mb-1 font-display">VOTED</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800">11/11</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">Rating Success</span>
              </div>
            </motion.div>
          </div>

          {/* Text Content */}
          <div className="text-center w-full px-2 shrink-0">
            <h2 className="text-[32px] sm:text-[40px] font-black leading-[1.1] mb-3 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent italic">
              YOU'VE RATED ALL <br />
              <span className="text-[#8B5CF6]">11 STALLS!</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed font-medium">
              Thank you for participating!
            </p>
          </div>


          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors text-2xl"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Branding Block - Re-enlarged but strictly positioned */}
          <div className="flex flex-col items-center gap-6 relative z-10 w-full shrink-0">
            {/* Powered By Section */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 text-center font-display mb-3">
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
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 text-center font-display mb-3">
                In Collaboration with
              </span>
              <div className="flex items-center justify-center gap-6 sm:gap-8">
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
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center opacity-80 hover:opacity-100 transition-all hover:scale-105"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}