import { CircleX, RefreshCw } from "lucide-react";
import { ResultPage } from "../components/ui/ResultPage";

export default function DonateCancel() {
  return (
    <ResultPage
      variant="cancel"
      title="Donatia a fost anulata"
      description="Plata nu a fost finalizata. Poti incerca din nou imediat, iar daca problema persista te rugam sa ne contactezi."
      metaTitle="Donație anulată"
      metaDescription="Plata nu a fost finalizată. Poți relua donația sau ne poți contacta pentru ajutor."
      icon={<CircleX className="w-9 h-9" />}
      actions={[
        {
          label: "Incearca din nou",
          to: "/donate",
          icon: <RefreshCw className="w-4 h-4 ml-2" />,
        },
        {
          label: "Contacteaza-ne",
          to: "/contact",
          tone: "secondary",
        },
      ]}
    />
  );
}
