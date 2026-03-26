import { motion } from 'motion/react';
import { X, CheckCircle2, Star } from 'lucide-react';
import { UserButton } from "@clerk/react";
import Footer from "./Footer";

interface CompletionScreenProps {
  onClose: () => void;
  onGoToProfile: () => void;
  onViewLeaderboard: () => void;
}

export default function CompletionScreen({ onClose }: CompletionScreenProps) {
  return (
    <div className="h-[100dvh] bg-slate-50 relative flex flex-col overflow-hidden font-sans text-slate-900">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <h1 className="text-xl font-bold font-display tracking-tight text-[#FF2D55]">Coastal Startup Fest</h1>
        <div className="flex items-center gap-3">
          <UserButton />
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-[#FF2D55]" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-8 pb-12 flex flex-col items-center">
        {/* Hero Illustration */}
        <div className="relative w-full aspect-square max-w-[320px] mb-12 flex items-center justify-center mt-8">
          {/* Background Decorative Frame */}
          <div className="absolute inset-0 border border-slate-200 rounded-3xl transform rotate-3" />
          <div className="absolute inset-0 border border-slate-200 rounded-3xl transform -rotate-3" />

          {/* Main Visual (Red/Orange Card) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
            animate={{ scale: 1, opacity: 1, rotate: 10 }}
            className="relative w-[70%] h-[70%] bg-gradient-to-br from-[#FF2D55] to-[#FF6321] rounded-2xl shadow-2xl shadow-red-500/30 overflow-hidden flex items-center justify-center -translate-y-4 translate-x-4"
          >
            <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/concert/800/800')] bg-cover bg-center opacity-40 mix-blend-overlay" />
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Star className="w-8 h-8 text-[#FF2D55] fill-[#FF2D55]" />
            </div>
          </motion.div>

          {/* Submission Success Card Overlay */}
          <motion.div
            initial={{ x: -40, y: 40, opacity: 0 }}
            animate={{ x: -20, y: 20, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-10 left-0 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 flex items-start gap-4 w-[75%] z-10"
          >
            <div className="w-12 h-12 bg-[#FF2D55]/10 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-[#FF2D55]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF2D55] block mb-1">Submission Success</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-800">15/15</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Stalls Rated Today</span>
            </div>
          </motion.div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-10">
          <h2 className="text-[40px] font-black text-slate-900 leading-[1.1] mb-4">
            You've rated all <br />
            <span className="text-[#FF2D55]">15 stalls!</span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed px-4">
            Your votes are now officially counted. <br />
            Thank you for participating!
          </p>
        </div>
        
        <div className="w-full mt-auto mt-8 -mx-8 -mb-12">
          <Footer className="pb-16" />
        </div>
      </main>
    </div>
  );
}
