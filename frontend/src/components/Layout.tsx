import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded shadow"
      >
        Sari la conținut
      </a>
      <Navbar />
      <main
        id="content"
        role="main"
        className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors"
      >
        {/* Live region for dynamic status messages (polite) */}
        <div
          id="app-live-region"
          aria-live="polite"
          data-live-region
          className="sr-only"
        />
        <Outlet />
      </main>
      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 mt-8 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Asociația Zâmbete Magice. Toate drepturile
        rezervate.
      </footer>
    </>
  );
}
