import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/sigla-no bg.webp";

// Variant fără niciun background: doar sigla + buton Donează + control minimizare.
export function FloatingLogoBadge() {
  const [minimized, setMinimized] = useState(false);

  const imageSize = minimized ? "h-16" : "h-56 md:h-60";
  const donateSize = minimized
    ? "px-2 py-1 text-[10px]"
    : "px-3 py-1.5 text-xs";

  return (
    <div className="fixed bottom-4 left-4 z-40 select-none flex items-center gap-2">
      {/* Logo - acționează ca toggle pentru minimizare/restaurare */}
      <img
        src={Logo}
        alt="Sigla Asociația Zâmbete Magice"
        className={`${imageSize} w-auto object-contain transition-all duration-300 cursor-pointer`}
        loading="lazy"
        decoding="async"
        tabIndex={0}
        role="button"
        aria-pressed={minimized}
        aria-label={minimized ? "Restabilește mărimea" : "Micșorează insigna"}
        onClick={() => setMinimized((m) => !m)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setMinimized((m) => !m);
        }}
      />
      {/* Donate button - mic și mereu vizibil */}
      <Link
        to="/donate"
        aria-label="Donează acum"
        className={`inline-flex items-center gap-1 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-semibold shadow ${donateSize} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors`}
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
    </div>
  );
}
