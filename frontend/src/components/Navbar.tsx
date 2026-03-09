import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import Logo from "../assets/sigla-no bg.webp";

const links = [
  { to: "/", label: "Home" },
  { to: "/campanii", label: "Campanii" },
  { to: "/campanii/istoric", label: "Istoric" },
  { to: "/about", label: "Despre" },
  { to: "/contact", label: "Contact" },
];

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  return (
    <nav className="fixed top-0 left-0 w-full z-20 backdrop-blur-md bg-white/90 dark:bg-gray-900/85 border-b border-slate-200 dark:border-gray-700 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 group"
          aria-label="Acasă - Asociația Zâmbete Magice"
        >
          <img
            src={Logo}
            alt="Sigla Zâmbete Magice"
            className="h-12 w-auto object-contain drop-shadow-sm transition-transform group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
          />
          <span className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
            Zâmbete Magice
          </span>
        </Link>
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-[0.98rem] font-semibold transition-colors ${
                  isActive
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-slate-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-300"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/donate"
            className="ml-2 inline-flex items-center px-5 py-2.5 rounded-full bg-amber-700 text-white text-[0.98rem] font-semibold shadow hover:bg-amber-800 transition"
          >
            Donează
          </NavLink>
          <button
            type="button"
            onClick={toggle}
            aria-label="Comută tema"
            className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {theme === "dark" ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3a9 9 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07 6.07-1.42-1.42M6.35 6.35 4.93 4.93m12.72 0-1.42 1.42M6.35 17.65l-1.42 1.42" />
              </svg>
            )}
          </button>
        </div>
        {/* Mobile button */}
        <button
          aria-label="Deschide meniul"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden inline-flex items-center justify-center rounded p-2 text-amber-800 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>
      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-4 pt-2 pb-4 flex flex-col gap-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `py-2.5 text-[0.98rem] font-semibold transition-colors ${
                  isActive
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-slate-700 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-300"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/donate"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex justify-center px-4 py-2.5 rounded-full bg-amber-700 text-white text-[0.98rem] font-semibold shadow hover:bg-amber-800 transition"
          >
            Donează
          </NavLink>
          <button
            type="button"
            onClick={toggle}
            aria-label="Comută tema"
            className="mt-2 inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {theme === "dark" ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3a9 9 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07 6.07-1.42-1.42M6.35 6.35 4.93 4.93m12.72 0-1.42 1.42M6.35 17.65l-1.42 1.42" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
