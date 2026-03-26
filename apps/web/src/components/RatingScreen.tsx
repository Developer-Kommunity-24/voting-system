import { useState } from 'react';
import { motion } from 'motion/react';
import { User, ChevronLeft, Send, BarChart3, Vote } from 'lucide-react';
import { UserButton } from "@clerk/react";
import Footer from "./Footer";

interface RatingScreenProps {
  stallId: string;
  onBack?: () => void;
  onProgress?: () => void;
  onSubmitSuccess?: (rating: number) => void;
  ratedCount?: number;
  totalCount?: number;
}

export default function RatingScreen({ stallId, onBack, onProgress, onSubmitSuccess, ratedCount = 0, totalCount = 5 }: RatingScreenProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedRating !== null) {
      setIsSubmitted(true);

      // Simulate network delay then redirect
      setTimeout(() => {
        onSubmitSuccess?.(selectedRating);
      }, 1500);
    }
  };

  const ratings = Array.from({ length: 11 }, (_, i) => i);

  return (
    <div className="h-[100dvh] bg-white relative flex flex-col overflow-hidden font-sans text-slate-900">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#FF2D55]" />
          </button>
          <h1 className="text-xl font-bold font-display tracking-tight text-[#FF2D55]">Coastal Startup Fest</h1>
        </div>
        <div className="flex items-center justify-center">
          <UserButton />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Progress Section */}
        <div className="px-6 py-6">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-1">Your Progress</span>
              <h2 className="text-2xl font-bold font-display text-slate-900">{ratedCount}/{totalCount} stalls rated</h2>
            </div>
            <span className="text-sm font-bold text-[#FF2D55]">{Math.round((ratedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(ratedCount / totalCount) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#FF2D55] to-[#FF6321]"
            />
          </div>
        </div>

        {/* Current Stall Card */}
        <div className="px-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF2D55] to-[#FF6321] p-8 text-white shadow-xl shadow-red-500/20"
          >
            {/* Topographic Pattern Overlay */}
            <svg className="absolute inset-0 opacity-20 pointer-events-none" width="100%" height="100%" viewBox="0 0 400 400">
              <path d="M-50,150 C50,100 150,250 250,150 S350,50 450,150" fill="none" stroke="white" strokeWidth="2" />
              <path d="M-50,250 C80,180 180,350 280,250 S380,150 450,250" fill="none" stroke="white" strokeWidth="2" />
              <path d="M-50,50 C100,0 200,100 300,50 S400,0 450,50" fill="none" stroke="white" strokeWidth="2" />
            </svg>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mb-6 shadow-inner">
                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-lg">
                  <Vote className="w-8 h-8 text-[#FF2D55]" />
                </div>
              </div>
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">Current Stall</span>
              <h3 className="text-3xl font-bold font-display mb-3 leading-tight">Stall #{stallId.padStart(2, '0')}: Eco-Tech Solutions</h3>
              <p className="text-white/90 text-sm leading-relaxed max-w-[280px] font-medium">
                Innovating sustainable hardware for the next digital era.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Rating Grid */}
        <div className="px-6 mb-8">
          <div className="text-center mb-6">
            <h4 className="text-lg font-bold text-slate-800 mb-1">
              {isSubmitted ? 'Your rating has been recorded' : 'Rate this stall from 0 to 10'}
            </h4>
            <p className="text-slate-400 text-xs">
              {isSubmitted ? `You voted ${selectedRating}/10 for this stall` : 'Tap a number to cast your vote'}
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {ratings.map((rating) => (
              <motion.button
                key={rating}
                disabled={isSubmitted}
                whileHover={!isSubmitted ? { scale: 1.05 } : {}}
                whileTap={!isSubmitted ? { scale: 0.95 } : {}}
                onClick={() => setSelectedRating(rating)}
                className={`
                  aspect-square rounded-2xl flex items-center justify-center text-xl font-bold transition-all border-2
                  ${selectedRating === rating
                    ? 'bg-[#FF2D55] border-[#FF2D55] text-white shadow-lg shadow-red-500/30'
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}
                  ${isSubmitted && selectedRating !== rating ? 'opacity-40' : ''}
                  ${isSubmitted ? 'cursor-default' : ''}
                `}
              >
                {rating}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-6">
          <motion.button
            disabled={selectedRating === null || isSubmitted}
            onClick={handleSubmit}
            whileHover={selectedRating !== null && !isSubmitted ? { scale: 1.02 } : {}}
            whileTap={selectedRating !== null && !isSubmitted ? { scale: 0.98 } : {}}
            className={`
              w-full py-5 rounded-2xl font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all
              ${selectedRating !== null && !isSubmitted
                ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF6321] text-white shadow-xl shadow-red-500/30'
                : isSubmitted
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
            `}
          >
            {isSubmitted ? 'Vote Recorded' : 'Submit Rating'}
            {!isSubmitted && <Send className="w-5 h-5" />}
            {isSubmitted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
              >
                <div className="w-3 h-3 bg-white rounded-full" />
              </motion.div>
            )}
          </motion.button>
        </div>

        {/* Footer */}
        <div className="mt-12 -mx-6 -mb-24">
          <Footer className="pb-[7rem]" />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-4 flex items-center justify-between z-40">
        <button className="flex flex-col items-center gap-1 text-[#FF2D55]">
          <Vote className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Vote</span>
        </button>
        <button
          onClick={onProgress}
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-slate-400 transition-colors"
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Progress</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-300 hover:text-slate-400 transition-colors">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
        </button>
      </nav>
    </div>
  );
}
