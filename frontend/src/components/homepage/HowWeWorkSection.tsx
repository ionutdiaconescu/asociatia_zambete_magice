import { RichHtml } from "../ui/RichHtml";

interface HowWeWorkSectionProps {
  title?: string | null;
  description?: string | null;
}

export function HowWeWorkSection({
  title,
  description,
}: HowWeWorkSectionProps) {
  const steps = [
    {
      icon: "🔍",
      title: "Identificăm nevoia",
      description:
        "Analizăm situația și identificăm unde e nevoie de ajutor urgent în comunitatea noastră",
    },
    {
      icon: "📋",
      title: "Planificăm intervenția",
      description:
        "Creăm un plan detaliat și transparent pentru a oferi cel mai eficient ajutor",
    },
    {
      icon: "🤝",
      title: "Mobilizăm resurse",
      description:
        "Strângem fondurile și resursele necesare prin campanii și parteneriate",
    },
    {
      icon: "❤️",
      title: "Oferim sprijin",
      description:
        "Implementăm soluții concrete care fac o diferență reală în viața copiilor",
    },
    {
      icon: "📊",
      title: "Monitorizăm progresul",
      description:
        "Urmărim impactul acțiunilor noastre și ne asigurăm că ajutorul ajunge unde trebuie",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {title || "Cum lucrăm"}
          </h2>
          {description ? (
            <RichHtml
              html={description}
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            />
          ) : (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Procesul nostru este transparent și eficient, axat pe nevoile
              reale ale copiilor din comunitatea noastră.
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full text-white text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
