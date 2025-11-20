import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/sigla-no bg.webp";

export function FloatingLogoBadge() {
  // States: minimized -> very small icon; collapsed -> large logo only; expanded -> logo + donate button.
  const [minimized, setMinimized] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const toggleExpand = () => {
    if (minimized) {
      // First restore to collapsed
      setMinimized(false);
      setCollapsed(true);
    } else {
      setCollapsed((c) => !c);
    }
  };
  const toggleMinimize = () => setMinimized((m) => !m);

  const sizeClasses = minimized
    ? "w-20 h-20"
    : collapsed
    ? "w-56 h-56 md:w-64 md:h-64"
    : "w-64 h-56 md:w-72 md:h-64";

  return (
    <div className="fixed bottom-4 left-4 z-40 select-none">
      <div
        className={`relative transition-all duration-300 ease-out ${sizeClasses}`}
      >
        {/* Glass background */}
        <div className="absolute inset-0 rounded-3xl bg-white/30 dark:bg-gray-900/40 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-lg" />
        <div
          className={`relative flex h-full ${
            minimized
              ? "items-center justify-center p-1"
              : collapsed
              ? "items-center justify-center p-3"
              : "items-center p-4 pr-16 gap-4"
          }`}
        >
          <button
            type="button"
            onClick={toggleExpand}
            aria-label={
              minimized
                ? "Restabilește insigna"
                : collapsed
                ? "Extinde pentru donație"
                : "Micșorează insigna la logo"
            }
            className="focus:outline-none"
          >
            <img
              src={Logo}
              alt="Sigla Asociația Zâmbete Magice"
              className={`object-contain ${
                minimized
                  ? "h-14 w-auto"
                  : collapsed
                  ? "h-52 w-auto md:h-56"
                  : "h-52 w-auto md:h-56"
              }`}
              loading="lazy"
              decoding="async"
            />
          </button>
          {!minimized && !collapsed && (
            <div className="flex-1 flex items-center justify-center">
              <Link
                to="/donate"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Donează acum"
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
          )}
          {/* Controls */}
          <div className="absolute flex flex-col gap-2 bottom-3 right-3">
            <button
              type="button"
              onClick={toggleExpand}
              aria-label={
                minimized
                  ? "Extinde insigna"
                  : collapsed
                  ? "Deschide pentru donație"
                  : "Restrânge la logo"
              }
              className="bg-gray-800/80 hover:bg-gray-900 text-white rounded-full w-10 h-10 text-sm font-medium flex items-center justify-center shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {minimized ? "+" : collapsed ? "+" : "−"}
            </button>
            <button
              type="button"
              onClick={toggleMinimize}
              aria-label={
                minimized ? "Restabilește mărimea" : "Minimizează insigna"
              }
              className="bg-gray-700/80 hover:bg-gray-800 text-white rounded-full w-10 h-10 text-xs font-medium flex items-center justify-center shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {minimized ? "↺" : "↘"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
