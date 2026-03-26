interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`w-full flex flex-col items-center px-4 pt-4 pb-1 bg-gradient-to-r from-[#FF2D55] to-[#FF6321] border-t border-white/10 shrink-0 mt-auto z-20 relative text-white ${className}`}>

      <div className="flex flex-row items-stretch justify-center gap-4 sm:gap-8 w-full max-w-lg">

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
        <div className="w-px bg-white/20"></div>

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

      </div>
    </footer>
  );
}
