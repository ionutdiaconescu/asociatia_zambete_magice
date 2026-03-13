import { CheckCircle2, ArrowRight } from "lucide-react";
import { ResultPage } from "../components/ui/ResultPage";

export default function DonateSuccess() {
  return (
    <ResultPage
      variant="success"
      title="Multumim pentru donatie!"
      description="Donatia ta a fost procesata cu succes. Iti multumim ca alegi sa fii parte din schimbare."
      metaTitle="Donație procesată"
      metaDescription="Plata a fost procesată cu succes. Îți mulțumim pentru sprijin."
      icon={<CheckCircle2 className="w-9 h-9" />}
      actions={[
        {
          label: "Vezi campaniile",
          to: "/campanii",
          icon: <ArrowRight className="w-4 h-4 ml-2" />,
        },
        {
          label: "Inapoi la inceput",
          to: "/",
          tone: "secondary",
        },
      ]}
    />
  );
}
