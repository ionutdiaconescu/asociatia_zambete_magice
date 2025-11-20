import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/sigla-no bg.webp";

export function FloatingLogoBadge() {
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Persistă starea ascuns (nu reafișăm după reload dacă user a închis)
  useEffect(() => {
    const stored = localStorage.getItem("badgeHidden");
    if (stored === "true") setHidden(true);
  }, []);
  useEffect(() => {
    localStorage.setItem("badgeHidden", hidden ? "true" : "false");
  }, [hidden]);
  if (hidden) return null;
  return (
    <div className="fixed top-4 left-4 z-40 select-none">
      <div
        className={`relative transition-all duration-500 ease-out ${
          collapsed ? "w-28 h-28" : "w-[380px] max-w-[90vw]"
        } `}
      >
        <div className="absolute inset-0 rounded-3xl bg-white/95 dark:bg-gray-900/90 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-2xl" />
        <div
          className={`relative flex ${
            collapsed
              ? "flex-col items-center justify-center p-2"
              : "items-center gap-6 p-5 pr-12"
          } h-full`}
        >
          <img
            src={Logo}
            alt="Sigla Asociația Zâmbete Magice (conține text)"
            className={`${
              collapsed ? "h-20 w-auto" : "h-24 w-auto"
            } object-contain drop-shadow-xl`}
            loading="lazy"
            decoding="async"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0 space-y-3">
              <p className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Asociația Zâmbete Magice
              </p>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Transformăm nevoi reale în zâmbete pentru copii. Acces rapid la
                susținere financiară.
              </p>
              <div>
                <Link
                  to="/donate"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Donează acum"
                >
                  <svg
                    className="w-4 h-4"
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
            </div>
          )}
          <button
            type="button"
            onClick={() => setHidden(true)}
            aria-label="Închide insigna"
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-7 h-7 text-sm flex items-center justify-center shadow focus:outline-none"
          >
            ×
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Extinde insigna" : "Restrânge insigna"}
            className="absolute bottom-2 right-2 bg-gray-800/80 hover:bg-gray-900 text-white rounded-full w-9 h-9 text-xs font-medium flex items-center justify-center shadow focus:outline-none"
          >
            {collapsed ? "Deschide" : "Micșorează"}
          </button>
        </div>
      </div>
    </div>
  );
}
