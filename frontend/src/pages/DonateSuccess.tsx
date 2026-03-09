import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function DonateSuccess() {
  return (
    <section className="min-h-[70vh] flex items-center py-16 px-4 bg-[linear-gradient(180deg,#fff9f2_0%,#ffffff_46%,#fff8ef_100%)]">
      <div className="max-w-3xl mx-auto w-full">
        <div className="rounded-3xl border border-amber-200 bg-white shadow-[0_16px_42px_rgba(180,83,9,0.18)] p-8 md:p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Multumim pentru donatie!
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Donatia ta a fost procesata cu succes. Iti multumim ca alegi sa fii
            parte din schimbare.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/campanii"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
            >
              Vezi campaniile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Inapoi la inceput
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
