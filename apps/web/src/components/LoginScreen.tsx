import { motion } from "motion/react";

interface LoginScreenProps {
  onStart?: () => void;
}

export default function LoginScreen({ onStart }: LoginScreenProps) {
  return (
    <div className="h-[100dvh] bg-wevote-gradient relative select-none overflow-y-auto md:overflow-hidden overflow-x-hidden">
      {/* Background Patterns */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle Dot Grid */}
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] md:[background-size:20px_20px]"></div>

        {/* Topographic Background Lines */}
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" className="opacity-40 w-full h-full">
          <path d="M-100,200 C100,100 300,400 500,200 S800,0 1100,200" className="topographic-line" />
          <path d="M-100,400 C150,300 400,600 650,400 S900,200 1100,400" className="topographic-line" />
          <path d="M-100,600 C200,500 500,800 800,600 S1000,400 1100,600" className="topographic-line" />
          <path d="M-100,800 C250,700 600,1000 900,800 S1100,600 1200,800" className="topographic-line" />
          <path d="M-100,50 C200,-50 500,150 800,50 S1000,-50 1100,50" className="topographic-line" />
          <path d="M-100,950 C300,850 700,1150 1000,950 S1200,750 1300,950" className="topographic-line" />
        </svg>
      </div>

      <div className="h-full min-h-full flex flex-col items-center justify-between p-6 sm:p-8 md:p-12 lg:p-16 relative z-10">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-4 md:py-0">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center mb-6 sm:mb-8 md:mb-12 text-center"
          >
            <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6">
              {/* Logo Placeholder */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl mb-1 sm:mb-2 border-2 border-white/20">
                <span className="text-[#FF2D55] font-black text-sm sm:text-base md:text-lg tracking-tighter font-display">LOGO</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-display tracking-tight leading-tight text-center">
                Coastal <br className="sm:hidden" />Startup Fest
              </h1>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-medium text-center max-w-[280px] sm:max-w-md md:max-w-2xl lg:max-w-5xl leading-tight px-4 mb-8 sm:mb-10 md:mb-12 opacity-90 mx-auto font-sans tracking-tight"
          >
            Empowering the next generation of coastal entrepreneurs!
          </motion.p>
        </div>

        {/* Action Section */}
        <div className="w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col items-center px-4 py-4 md:py-0 md:pb-8 mx-auto">
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.02, backgroundColor: "#f8f8f8" }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white text-[#FF2D55] font-bold py-4 sm:py-5 md:py-6 rounded-full text-base sm:text-lg md:text-xl lg:text-2xl shadow-xl uppercase tracking-[0.2em] mb-6 sm:mb-8 md:mb-12 transition-all font-display"
          >
            Get Started
          </motion.button>

          {/* Powered By Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-row items-stretch justify-center gap-4 sm:gap-8 w-full"
          >
            {/* Powered By Block */}
            <div className="flex flex-col items-center justify-between">
              <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-bold opacity-60 text-center font-display mb-2">Powered By</span>
              <a href="https://dk24.org/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity mt-auto">
                <div className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 overflow-hidden">
                  <img src="/dk24.png" alt="DK24" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs sm:text-sm font-bold font-display tracking-widest whitespace-nowrap">DK24</span>
              </a>
            </div>

            {/* Divider */}
            <div className="w-px bg-white/20 hidden sm:block"></div>

            {/* In Collaboration Block */}
            <div className="flex flex-col items-center justify-between">
              <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-bold opacity-60 text-center font-display mb-2">In Collaboration</span>
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-auto">
                {[
                  { id: 1, src: '/cosc.png', alt: 'COSC', url: 'https://www.linkedin.com/company/canara-students-open-source-community/' },
                  { id: 2, src: '/sosc.png', alt: 'SOSC', url: 'https://sosc.org.in/' },
                  { id: 3, src: '/sceptix.png', alt: 'Sceptix', url: 'https://www.sceptix.in/' }
                ].map((logo) => (
                  <a key={logo.id} href={logo.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-all group overflow-hidden rounded-md">
                      <img src={logo.src} alt={logo.alt} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity p-0.5 sm:p-1" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Home Indicator (Hidden on Desktop) */}
        <div className="w-32 h-1.5 bg-black/10 rounded-full mt-4 z-20 md:hidden shrink-0"></div>
      </div>
    </div>
  );
}