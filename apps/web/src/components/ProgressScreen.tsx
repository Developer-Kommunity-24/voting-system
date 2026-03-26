import { motion } from 'motion/react';
import { QrCode, CheckCircle2, Lock, Vote, BarChart3, User, ChevronLeft } from 'lucide-react';
import { UserButton } from "@clerk/react";
import Footer from "./Footer";

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
    <div className="h-[100dvh] bg-slate-50 relative flex flex-col overflow-hidden font-sans text-slate-900">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToVote}
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

      <main className="flex-1 overflow-y-auto pb-24 px-6">
        {/* Hero Section */}
        <div className="py-8">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Your Journey</span>
          <h2 className="text-4xl font-bold font-display text-slate-900 leading-tight mb-6">You're making progress!</h2>

          {/* Progress Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 mb-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-[#FF2D55]">{ratedCount}</span>
                  <span className="text-2xl font-bold text-slate-200">/{totalCount}</span>
                </div>
                <span className="text-sm font-bold text-slate-400">Stalls Rated</span>
              </div>
              <div className="px-4 py-2 bg-[#FF2D55]/10 rounded-full">
                <span className="text-[10px] font-bold text-[#FF2D55] uppercase tracking-wider">{progressPercentage}% Complete</span>
              </div>
            </div>
            <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                className="h-full bg-gradient-to-r from-[#FF2D55] to-[#FF6321]"
              />
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col gap-3">
              <div className="flex items-center gap-2">

                <p className="text-amber-900 text-sm font-bold">
                  You are voting for the People’s Choice Award.
                </p>
              </div>

              <div className="flex items-start gap-2 bg-amber-100/50 p-3 rounded-lg border border-amber-200/50">
                <span className="text-amber-600 mt-0.5 text-sm">⚠️</span>
                <p className="text-amber-800 text-xs font-medium leading-relaxed">
                  Your votes will be counted only if you rate at least <strong>10 different stalls</strong>.
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
              className="w-full py-5 bg-gradient-to-r from-[#FF2D55] to-[#FF6321] rounded-2xl text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-red-500/20"
            >
              <QrCode className="w-5 h-5" />
              <span>Scan the next QR code</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBackToVote} // This will trigger the completion logic or just stay here
              className="w-full py-5 bg-emerald-500 rounded-2xl text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>All Stalls Rated!</span>
            </motion.button>
          )}
        </div>

        {/* Directory Section */}
        <div className="pb-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold font-display text-slate-900">Stall Directory</h3>
          </div>

          <div className="space-y-3">
            {Array.from({ length: totalCount }).map((_, i) => {
              // We map purely by index for the visual directory slots. 
              // We grab the actual rated stall from the array dynamically to bypass hardcoded DB IDs.
              const ratedStall = ratedStalls[i]; 
              
              const status = ratedStall ? 'rated' : 'locked';
              
              const displayId = String(i + 1).padStart(2, '0');
              const stallName = ratedStall ? ratedStall.stallName : 'Locked Stall';

              return (
                <motion.div
                  key={`slot-${displayId}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`
                    p-4 rounded-2xl flex items-center justify-between border transition-all
                    ${status === 'locked' ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 shadow-sm'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0
                      ${status === 'rated' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-200 text-slate-400'}
                    `}>
                      {displayId}
                    </div>
                    <div>
                      <h4 className={`font-bold leading-tight ${status === 'locked' ? 'text-slate-400' : 'text-slate-800'}`}>
                        {stallName}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {status === 'rated' ? 'Rating submitted' : 'Scan QR to unlock'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {status === 'rated' ? (
                      <div className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-500 rounded-full">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center text-slate-300">
                        <Lock className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="-mx-6 mt-12 -mb-24">
          <Footer className="pb-[7rem]" />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-4 flex items-center justify-between z-40">
        <button
          onClick={onBackToVote}
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-slate-400 transition-colors"
        >
          <Vote className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Vote</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#FF2D55]">
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Progress</span>
        </button>
        <button
          onClick={onProfile}
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-slate-400 transition-colors"
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
        </button>
      </nav>
    </div>
  );
}
