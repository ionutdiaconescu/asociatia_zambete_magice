import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Meta } from "../seo/Meta";

type ResultPageVariant = "success" | "cancel";

interface ResultPageAction {
  label: string;
  to: string;
  icon?: ReactNode;
  tone?: "primary" | "secondary";
}

interface ResultPageProps {
  variant: ResultPageVariant;
  title: string;
  description: string;
  icon: ReactNode;
  metaTitle?: string;
  metaDescription?: string;
  actions: ResultPageAction[];
}

const VARIANT_STYLES: Record<
  ResultPageVariant,
  {
    sectionClassName: string;
    cardClassName: string;
    iconClassName: string;
  }
> = {
  success: {
    sectionClassName:
      "bg-[linear-gradient(180deg,#fff9f2_0%,#ffffff_46%,#fff8ef_100%)]",
    cardClassName: "border-amber-200 shadow-[0_16px_42px_rgba(180,83,9,0.18)]",
    iconClassName: "bg-amber-100 text-amber-700",
  },
  cancel: {
    sectionClassName:
      "bg-[linear-gradient(180deg,#fef2f2_0%,#ffffff_46%,#f8fafc_100%)]",
    cardClassName: "border-rose-200 shadow-[0_16px_42px_rgba(244,63,94,0.12)]",
    iconClassName: "bg-rose-100 text-rose-700",
  },
};

export function ResultPage({
  variant,
  title,
  description,
  icon,
  metaTitle,
  metaDescription,
  actions,
}: ResultPageProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <>
      <Meta
        title={metaTitle || title}
        description={metaDescription || description}
        noIndex
      />
      <section
        className={`min-h-[70vh] flex items-center py-16 px-4 ${styles.sectionClassName}`}
      >
        <div className="max-w-3xl mx-auto w-full">
          <div
            className={`rounded-3xl border bg-white p-8 md:p-12 text-center ${styles.cardClassName}`}
          >
            <div
              className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${styles.iconClassName}`}
            >
              {icon}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              {title}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {actions.map((action) => {
                const isPrimary = action.tone !== "secondary";

                return (
                  <Link
                    key={`${action.to}-${action.label}`}
                    to={action.to}
                    className={
                      isPrimary
                        ? "inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                        : "inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                    }
                  >
                    <span>{action.label}</span>
                    {action.icon ? action.icon : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
