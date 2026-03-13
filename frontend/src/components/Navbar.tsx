import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import Logo from "../assets/sigla-no bg.webp";

const links = [
  { to: "/", label: "Home" },
  { to: "/campanii", label: "Campanii" },
  { to: "/campanii/istoric", label: "Istoric" },
  { to: "/about", label: "Despre" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 z-20 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 pr-3 sm:gap-3 group"
          aria-label="Acasă - Asociația Zâmbete Magice"
        >
          <span className="rounded-2xl">
            <img
              src={Logo}
              alt="Sigla Zâmbete Magice"
              className="h-10 w-auto object-contain drop-shadow-sm transition-transform group-hover:scale-[1.04] sm:h-12"
              loading="lazy"
              decoding="async"
            />
          </span>
          <span className="max-w-[10.5rem] truncate text-lg font-extrabold leading-tight tracking-tight text-slate-900 sm:max-w-none sm:text-2xl md:text-3xl">
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
                    ? "text-amber-800"
                    : "text-slate-600 hover:text-amber-800"
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
        </div>
        {/* Mobile button */}
        <button
          aria-label="Deschide meniul"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden shrink-0 inline-flex items-center justify-center rounded p-2 text-amber-800 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
        className={`md:hidden overflow-hidden border-b border-gray-200 bg-white transition-[max-height] duration-300 ${
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
                    ? "text-amber-800"
                    : "text-slate-700 hover:text-amber-800"
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
        </div>
      </div>
    </nav>
  );
}
