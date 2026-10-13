interface FooterProps {
  className?: string;
  variant?: "default" | "transparent";
}

export default function Footer({
  className = "",
  variant = "default",
}: FooterProps) {
  const bgClasses =
    variant === "transparent"
      ? "!bg-none !bg-transparent"
      : "bg-gradient-to-r from-[#FF2D55] to-[#FF6321] border-t border-white/10";

  return (
    <footer
      className={`w-full flex flex-col items-center px-4 pt-4 pb-1 shrink-0 mt-auto z-20 relative text-white pointer-events-auto ${bgClasses} ${className}`}
    >
      <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 w-full max-w-lg">

        {/* POWERED BY */}
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.2em] font-bold opacity-70 text-center mb-2">
            Powered By
          </span>

          <a
            href="https://dk24.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity mt-auto"
          >
            <img
              src="/Consortium Logo.svg"
              alt="DK24"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </a>
        </div>

        {/* COLLAB */}
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.2em] font-bold opacity-70 text-center mb-2 sm:mb-3">
            In Collaboration With
          </span>

          <div className="flex items-center gap-4 sm:gap-6">
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
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="w-full h-full object-contain"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}