interface StatisticsSectionProps {
  yearsActive: number;
  totalBeneficiaries: number;
  completedProjects: number;
  activeVolunteers: number;
}

export function StatisticsSection({
  yearsActive,
  totalBeneficiaries,
  completedProjects,
  activeVolunteers,
}: StatisticsSectionProps) {
  const stats = [
    {
      icon: "📅",
      value: yearsActive,
      label: "Ani de activitate",
      color: "text-amber-800",
      bgColor: "bg-white",
    },
    {
      icon: "👥",
      value: totalBeneficiaries,
      label: "Copii ajutați",
      color: "text-rose-700",
      bgColor: "bg-white",
    },
    {
      icon: "🎯",
      value: completedProjects,
      label: "Proiecte finalizate",
      color: "text-orange-700",
      bgColor: "bg-white",
    },
    {
      icon: "🤝",
      value: activeVolunteers,
      label: "Voluntari activi",
      color: "text-rose-700",
      bgColor: "bg-white",
    },
  ];

  return (
    <section className="py-20 bg-[linear-gradient(180deg,#fffaf2_0%,#fff6ed_100%)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Impactul nostru în cifre
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Fiecare număr reprezintă o poveste de speranță și transformare
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} p-6 md:p-8 rounded-3xl text-center border border-slate-200 transform hover:translate-y-[-2px] transition-all duration-300 shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.11)]`}
            >
              <div className="text-4xl md:text-5xl mb-4">{stat.icon}</div>
              <div
                className={`text-3xl md:text-4xl lg:text-5xl font-bold ${stat.color} mb-2`}
              >
                {stat.value.toLocaleString("ro-RO")}
              </div>
              <div className="text-slate-600 font-medium text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
