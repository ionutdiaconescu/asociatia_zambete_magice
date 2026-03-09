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

  const badgeThemes = [
    {
      iconWrap:
        "bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200",
      label: "text-amber-700",
    },
    {
      iconWrap: "bg-gradient-to-br from-rose-50 to-amber-100 border-rose-200",
      label: "text-rose-700",
    },
    {
      iconWrap:
        "bg-gradient-to-br from-orange-50 to-yellow-100 border-orange-200",
      label: "text-orange-700",
    },
  ] as const;

  return (
    <section className="py-20 bg-[linear-gradient(180deg,#fffaf2_0%,#ffffff_100%)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
            {title || "Cum lucrăm"}
          </h2>
          {description ? (
            <RichHtml
              html={description}
              className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
            />
          ) : (
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Procesul nostru este transparent și eficient, axat pe nevoile
              reale ale copiilor din comunitatea noastră.
            </p>
          )}
        </div>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => {
            const theme = badgeThemes[index % badgeThemes.length];

            return (
              <div
                key={index}
                className="group rounded-3xl border border-amber-100/80 bg-[#fffdf9] p-6 md:p-8 hover:shadow-[0_12px_30px_rgba(120,53,15,0.12)] transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full border text-2xl shadow-sm ${theme.iconWrap}`}
                  >
                    <span className="drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
                      {step.icon}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-[0.16em] ${theme.label}`}
                  >
                    Pasul {index + 1}
                  </span>
                </div>
                <h3 className="text-xl md:text-[1.3rem] font-semibold text-slate-900 mb-3 leading-snug">
                  {step.title}
                </h3>
                <p className="text-base text-slate-600 leading-8 max-w-[36ch]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
