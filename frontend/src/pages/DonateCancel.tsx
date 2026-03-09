import { Link } from "react-router-dom";
import { CircleX, RefreshCw } from "lucide-react";

export default function DonateCancel() {
  return (
    <section className="min-h-[70vh] flex items-center py-16 px-4 bg-[linear-gradient(180deg,#fef2f2_0%,#ffffff_46%,#f8fafc_100%)]">
      <div className="max-w-3xl mx-auto w-full">
        <div className="rounded-3xl border border-rose-200 bg-white shadow-[0_16px_42px_rgba(244,63,94,0.12)] p-8 md:p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-6">
            <CircleX className="w-9 h-9" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Donatia a fost anulata
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Plata nu a fost finalizata. Poti incerca din nou imediat, iar daca
            problema persista te rugam sa ne contactezi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/donate"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
            >
              Incearca din nou
              <RefreshCw className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Contacteaza-ne
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
