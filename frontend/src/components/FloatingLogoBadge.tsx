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
        className="group relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-300/80 dark:border-gray-600/70 bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm text-gray-700 dark:text-gray-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all hover:bg-white dark:hover:bg-gray-800"
      >
        <span className="sr-only">
          {minimized ? "Restabilește mărimea" : "Micșorează insigna"}
        </span>
        {minimized ? (
          // Icon restore (maximize)
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4H10V6H6V10H4V4Z" />
            <path d="M20 20H14V18H18V14H20V20Z" />
            <path d="M14 4H20V10H18V6H14V4Z" />
            <path d="M4 14H6V18H10V20H4V14Z" />
          </svg>
        ) : (
          // Icon minimize (compress)
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 15H4V20H9V18H6V15H9Z" />
            <path d="M15 9H20V4H15V6H18V9H15Z" />
            <path d="M9 9V6H6V4H11V9H9Z" />
            <path d="M15 15V18H18V20H13V15H15Z" />
          </svg>
        )}
        {/* Accent ring animată subtil la hover */}
        <span className="absolute inset-0 rounded-full ring-0 group-hover:ring-2 ring-blue-500/40 transition-all" />
      </button>
    </div>
  );
}
