import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[linear-gradient(180deg,#fffaf2_0%,#ffffff_46%,#fff8ef_100%)]">
      <div className="max-w-2xl w-full text-center rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 md:p-14 shadow-[0_12px_36px_rgba(15,23,42,0.10)]">
        <p className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase mb-4">
          Eroare de navigare
        </p>
        <h1 className="mb-4 text-5xl font-extrabold text-slate-900 sm:text-6xl md:text-7xl">
          404
        </h1>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
          Pagina pe care o cauti nu exista sau link-ul este invalid.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
          >
            Inapoi la inceput
          </Link>
          <Link
            to="/campanii"
            className="inline-flex items-center px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Vezi campaniile
          </Link>
        </div>
      </div>
    </section>
  );
}
