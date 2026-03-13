import { Link } from "react-router-dom";

interface TransparencySectionProps {
  title?: string | null;
}

export function TransparencySection({ title }: TransparencySectionProps) {
  const breakdown = [
    {
      icon: "🍎",
      percentage: 70,
      label: "Direct către beneficiari",
      description: "Hrană, îmbrăcăminte, rechizite, medicamente",
      color: "text-amber-700",
      bgColor: "bg-amber-600",
    },
    {
      icon: "📋",
      percentage: 20,
      label: "Logistică și organizare",
      description: "Transport, depozitare, coordonare voluntari",
      color: "text-orange-700",
      bgColor: "bg-orange-600",
    },
    {
      icon: "💼",
      percentage: 10,
      label: "Administrare asociație",
      description: "Contabilitate, juridic, întreținere platformă",
      color: "text-rose-700",
      bgColor: "bg-rose-500",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50/60 to-rose-50/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
            {title || "Unde se duc banii tăi"}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Transparența este fundamentul încrederii. Vezi exact cum folosim
            fiecare donație pentru a avea impactul maxim.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {breakdown.map((item, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_42px_rgba(15,23,42,0.16)] transition-shadow duration-300"
            >
              <div className="text-center">
                <div className="text-5xl mb-6">{item.icon}</div>
                <div className={`text-4xl font-bold ${item.color} mb-4`}>
                  {item.percentage}%
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  {item.label}
                </h3>
                <p className="text-slate-600 mb-6">{item.description}</p>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${item.bgColor} h-3 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-slate-600 mb-6">
            Pentru transparență, publicăm istoricul campaniilor și suma strânsă
            pentru fiecare dintre ele.
          </p>
          <Link
            to="/campanii/istoric"
            className="inline-flex items-center bg-amber-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-amber-800 transition-colors duration-300 shadow"
          >
            Vezi istoricul campaniilor
          </Link>
        </div>
      </div>
    </section>
  );
}
