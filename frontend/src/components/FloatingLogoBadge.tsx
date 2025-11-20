import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/sigla-no bg.webp";

export function FloatingLogoBadge() {
  const [collapsed, setCollapsed] = useState(true);
  const toggle = () => setCollapsed((c) => !c);
  return (
    <div className="fixed bottom-4 left-4 z-40 select-none">
      <div
        className={`group relative transition-all duration-500 ease-out ${
          collapsed ? "w-56 h-56" : "w-[480px] max-w-[94vw]"
        }`}
      >
        <div className="badge-ring-wrapper" aria-hidden="true">
          <div className="badge-rotating-border" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 rounded-3xl bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl border border-white/70 dark:border-white/10 shadow-[0_0_35px_-8px_rgba(99,102,241,0.45)]" />
        <div
          className={`relative flex ${
            collapsed
              ? "items-center justify-center p-4"
              : "items-center gap-8 p-8 pr-20"
          } h-full`}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={
              collapsed
                ? "Extinde insigna pentru donație"
                : "Micșorează insigna"
            }
            className="focus:outline-none"
          >
            <img
              src={Logo}
              alt="Sigla Asociația Zâmbete Magice (include denumirea)"
              className={`${
                collapsed ? "h-48 w-auto" : "h-52 w-auto"
              } object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.4)] transition-transform duration-700 group-hover:scale-[1.02]`}
              loading="lazy"
              decoding="async"
            />
          </button>
          {!collapsed && (
            <div className="flex-1 min-w-0 flex items-center gap-8">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 hover:from-blue-500 hover:to-fuchsia-500 text-white text-base font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                aria-label="Donează acum"
              >
                <svg
                  className="w-6 h-6"
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
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={
              collapsed ? "Deschide pentru donație" : "Restrânge insigna"
            }
            className="absolute bottom-3 right-3 bg-gray-900/80 dark:bg-gray-800/80 hover:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-full w-12 h-12 text-lg font-medium flex items-center justify-center shadow-lg backdrop-blur focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {collapsed ? "+" : "−"}
          </button>
        </div>
      </div>
    </div>
  );
}
