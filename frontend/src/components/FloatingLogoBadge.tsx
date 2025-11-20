import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/sigla-no bg.webp";

// Variant fără niciun background: doar sigla + buton Donează + control minimizare.
export function FloatingLogoBadge() {
  const [minimized, setMinimized] = useState(false);

  const toggleMinimize = () => setMinimized((m) => !m);

  const imageSize = minimized ? "h-16" : "h-56 md:h-60"; // păstrăm lizibilitatea în modul normal
  const donateSize = minimized
    ? "px-2 py-1 text-[10px]"
    : "px-3 py-1.5 text-xs";

  return (
    <div className="fixed bottom-4 left-4 z-40 select-none flex items-center gap-2">
      {/* Logo */}
      <img
        src={Logo}
        alt="Sigla Asociația Zâmbete Magice"
        className={`${imageSize} w-auto object-contain transition-all duration-300`}
        loading="lazy"
        decoding="async"
      />
      {/* Donate button - mic și mereu vizibil */}
      <Link
        to="/donate"
        aria-label="Donează acum"
        className={`inline-flex items-center gap-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow ${donateSize} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21C12 21 5 13.93 5 9.5C5 6.42 7.42 4 10.5 4C11.88 4 13.18 4.56 14 5.5C14.82 4.56 16.12 4 17.5 4C20.58 4 23 6.42 23 9.5C23 13.93 16 21 16 21H12Z" />
        </svg>
        Donează
      </Link>
      {/* Control minimizare/restaurare - design rafinat */}
      <button
        type="button"
        onClick={toggleMinimize}
        aria-label={minimized ? "Restabilește mărimea" : "Micșorează insigna"}
        aria-pressed={minimized}
        className="group relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-300/70 dark:border-gray-600/60 bg-white/70 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors"
      >
        <span className="sr-only">
          {minimized ? "Restabilește mărimea" : "Micșorează insigna"}
        </span>
        {minimized ? (
          // Sad face (minimized state)
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9 10h.01M15 10h.01" />
            <path d="M9 16c1-.8 2.5-1.2 3-1.2s2 .4 3 1.2" />
          </svg>
        ) : (
          // Smiley face (normal state)
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9 10h.01M15 10h.01" />
            <path d="M8.5 14.5c1 .9 2.5 1.5 3.5 1.5s2.5-.6 3.5-1.5" />
          </svg>
        )}
        <span className="absolute inset-0 rounded-full ring-0 group-hover:ring-2 ring-blue-500/40 transition-all" />
      </button>
    </div>
  );
}
