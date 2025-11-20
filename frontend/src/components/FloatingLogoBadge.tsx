import { useState } from "react";
import Logo from "../assets/sigla-no bg.webp";

export function FloatingLogoBadge() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 select-none">
      <div
        className={`group relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl transition-all duration-300 overflow-hidden flex items-center ${
          open ? "w-72 px-4 py-3" : "w-16 h-16 p-2"
        } cursor-pointer`}
        role="button"
        aria-label="Sigla Zâmbete Magice"
        onClick={() => setOpen((o) => !o)}
      >
        <img
          src={Logo}
          alt={open ? "Asociația Zâmbete Magice - siglă cu text" : "Siglă"}
          className={`transition-all duration-300 object-contain ${
            open ? "h-12 w-auto mr-3" : "h-12 w-12"
          }`}
          loading="lazy"
          decoding="async"
        />
        {open && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-1 tracking-wide">
              Asociația Zâmbete Magice
            </p>
            <p className="text-[10px] leading-tight text-gray-600 dark:text-gray-300">
              Transformăm nevoi în zâmbete pentru copii. Dă click pentru
              micșorare.
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setHidden(true);
          }}
          aria-label="Ascunde insigna siglă"
          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow hover:bg-red-700 focus:outline-none"
        >
          ×
        </button>
      </div>
      {!open && (
        <span className="text-[10px] text-gray-500 dark:text-gray-400 pr-1">
          Click pentru detalii
        </span>
      )}
    </div>
  );
}
