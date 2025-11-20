import { useState } from "react";
import Logo from "../../assets/sigla-no bg.webp";

export function LogoReadableBanner() {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* High contrast panel for logo */}
          <div className="relative group rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl p-6 lg:p-8 flex items-center justify-center w-full lg:w-[48%] transition">
            <img
              src={Logo}
              alt="Sigla Asociației Zâmbete Magice (conține text)"
              title="Asociația Zâmbete Magice"
              className={`object-contain max-w-full h-auto drop-shadow-xl select-none ${
                expanded ? "w-[520px]" : "w-[360px]"
              } transition-all duration-500 ease-out`}
              loading="lazy"
              decoding="async"
            />
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              aria-label={
                expanded ? "Micșorează sigla" : "Mărește sigla pentru citire"
              }
              className="absolute top-4 right-4 bg-white/80 dark:bg-gray-900/70 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200 shadow hover:bg-white dark:hover:bg-gray-800 transition"
            >
              {expanded ? "Micșorează" : "Mărește"}
            </button>
          </div>

          {/* Explanatory / accessibility text */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Identitate vizuală
            </h2>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
              Sigla noastră conține mesaj scris. Pentru utilizatori pe ecrane
              mici am adăugat un mod de <strong>mărire</strong> astfel încât
              textul să poată fi citit fără efort.
            </p>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm md:text-base">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-600"></span>
                <span>
                  Button "Mărește" permite vizualizarea detaliilor tipografice.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-600"></span>
                <span>Panoul alb/neutru crește contrastul și claritatea.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600"></span>
                <span>
                  Sigla nu este decupată: se păstrează proporțiile originale.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
