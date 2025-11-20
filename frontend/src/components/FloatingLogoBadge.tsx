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
      <img
        src={Logo}
        alt="Sigla Asociația Zâmbete Magice"
        className={`${imageSize} w-auto object-contain transition-all duration-300`}
        loading="lazy"
        decoding="async"
      />
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
      <button
        type="button"
        onClick={toggleMinimize}
        aria-label={minimized ? "Restabilește mărimea" : "Minimizează insigna"}
        className="rounded-full bg-gray-800 hover:bg-gray-900 text-white w-10 h-10 text-sm font-medium flex items-center justify-center shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition-colors"
      >
        {minimized ? "↺" : "↘"}
      </button>
    </div>
  );
}
