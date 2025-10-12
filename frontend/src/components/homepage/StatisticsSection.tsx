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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: "👥",
      value: totalBeneficiaries,
      label: "Copii ajutați",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: "🎯",
      value: completedProjects,
      label: "Proiecte finalizate",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: "🤝",
      value: activeVolunteers,
      label: "Voluntari activi",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Impactul nostru în cifre
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fiecare număr reprezintă o poveste de speranță și transformare
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} p-6 md:p-8 rounded-2xl text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
            >
              <div className="text-4xl md:text-5xl mb-4">{stat.icon}</div>
              <div
                className={`text-3xl md:text-4xl lg:text-5xl font-bold ${stat.color} mb-2`}
              >
                {stat.value.toLocaleString("ro-RO")}
              </div>
              <div className="text-gray-700 font-medium text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
