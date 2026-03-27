import { motion } from "motion/react";
import Footer from "./Footer";

interface LoginScreenProps {
  onStart?: () => void;
}

export default function LoginScreen({ onStart }: LoginScreenProps) {
  return (
    <div
      className="h-[100dvh] relative select-none overflow-hidden flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.webp')" }}
    >
      <div className="relative z-10 h-full flex flex-col items-center justify-between pt-10 pb-6 px-6 overflow-y-auto">

        {/* ── TOP: Logo ── */}
        <div className="flex-1 flex flex-col items-center justify-start w-full">
          <motion.div
            initial={{ opacity: 0, y: -28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center justify-center w-full max-w-[280px] sm:max-w-[360px]"
          >
            <img
              src="/csf-logo.png"
              alt="Coastal Startup Fest 2026"
              className="w-full h-auto object-contain drop-shadow-[0_4px_32px_rgba(0,180,255,0.25)]"
            />
          </motion.div>
        </div>

        {/* ── MIDDLE: Tagline & Communities ── */}
        <div className="flex flex-col items-center justify-start w-full gap-8 mt-6 z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-center font-display font-light text-[15px] sm:text-[17px] leading-relaxed tracking-wider text-white/90 drop-shadow-sm px-2 w-[95%] max-w-[400px]"
          >
            Empowering the next generation
            <br />
            of coastal entrepreneurs
          </motion.p>

          <div className="w-full max-w-[340px] sm:max-w-[400px] mt-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.55 }}
              className="scale-110 sm:scale-125 origin-center w-full"
            >
              <Footer variant="transparent" />
            </motion.div>
          </div>
        </div>

        {/* ── BOTTOM: CTA + down arrow ── */}
        <div className="flex-1 flex flex-col items-center justify-end w-full">
          <div className="flex flex-col items-center gap-3">
            <motion.button
              onClick={onStart}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              whileHover={{ scale: 1.05, filter: "brightness(1.12)" }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 sm:px-12 sm:py-4 rounded-[100px] font-display font-bold text-sm sm:text-base uppercase tracking-[0.18em] text-white"
              style={{
                background: "linear-gradient(90deg, #fca311 0%, #ff2d78 45%, #4a7cf6 100%)",
                boxShadow: "0 0 32px rgba(74,124,246,0.5), 0 0 16px rgba(252,163,17,0.3)",
                minWidth: "220px"
              }}
            >
              Get Started
            </motion.button>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              style={{ color: "rgba(170,100,255,0.9)" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}
