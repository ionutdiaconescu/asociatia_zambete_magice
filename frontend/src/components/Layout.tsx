import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { FloatingLogoBadge } from "./FloatingLogoBadge";

export default function Layout() {
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 bg-amber-700 text-white px-4 py-2 rounded shadow"
      >
        Sari la conținut
      </a>
      <Navbar />
      <main
        id="content"
        role="main"
        className="relative overflow-hidden pt-20 min-h-screen bg-[linear-gradient(180deg,#fffaf2_0%,#ffffff_42%,#fff8ef_100%)] dark:bg-gray-950 text-slate-900 dark:text-gray-100 transition-colors"
      >
        <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="pointer-events-none absolute top-24 -right-24 w-80 h-80 rounded-full bg-orange-200/30 blur-3xl" />
        {/* Live region for dynamic status messages (polite) */}
        <div
          id="app-live-region"
          aria-live="polite"
          data-live-region
          className="sr-only"
        />
        <Outlet />
      </main>
      <FloatingLogoBadge />
      <footer className="bg-white/95 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 mt-8 py-8 text-center text-sm text-slate-600 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium">
            © {new Date().getFullYear()} Asociația Zâmbete Magice
          </p>
          <p className="mt-1 text-slate-500">
            Solidaritate, transparență, impact real.
          </p>
        </div>
      </footer>
    </>
  );
}
