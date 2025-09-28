import { useState } from "react";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Section } from "../components/ui/Section";

const PRESET_AMOUNTS = [25, 50, 100, 250];

export default function Donate() {
  const [amount, setAmount] = useState<number | "">("");
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  function selectAmount(value: number) {
    setAmount(value);
    setCustom("");
  }

  function onCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/[^0-9]/g, "");
    setCustom(v);
    setAmount(v ? parseInt(v, 10) : "");
  }

  async function handleDonate() {
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_BASE_URL || "http://localhost:1337/api") +
          "/payments/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, campaignId: 1 }), // TODO: allow choosing a campaign
        }
      );
      if (!res.ok) throw new Error("Checkout session failed");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Missing session URL");
      }
    } catch (e) {
      console.error(e);
      alert("A apărut o eroare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Section
        title="Donează"
        description="Sprijină activitățile noastre și ajută-ne să aducem zâmbete copiilor. Alege o sumă sau introdu una personalizată."
      >
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Alege suma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {PRESET_AMOUNTS.map((v) => {
                    const active = amount === v;
                    return (
                      <button
                        type="button"
                        key={v}
                        onClick={() => selectAmount(v)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          active
                            ? "bg-blue-600 text-white border-blue-600 shadow"
                            : "border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        {v} RON
                      </button>
                    );
                  })}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Suma personalizată"
                      value={custom}
                      onChange={onCustomChange}
                      className="w-40 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
                    />
                    {custom && amount !== "" && (
                      <span className="text-xs text-gray-500">RON</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Detalii rapide</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Donațiile susțin programe educaționale și sociale.</li>
                  <li>
                    Vei primi un email de confirmare după integrarea Stripe.
                  </li>
                  <li>Poți oricând alege altă sumă.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rezumat donație</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Suma selectată</span>
                    <span className="font-semibold">
                      {amount ? `${amount} RON` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Comision procesare (estimativ)</span>
                    <span className="text-gray-500">Inclus</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-sm">
                    <span>Total</span>
                    <span className="font-bold text-gray-900">
                      {amount ? `${amount} RON` : "-"}
                    </span>
                  </div>
                  <Button
                    onClick={handleDonate}
                    disabled={!amount}
                    loading={loading}
                    className="w-full mt-2"
                  >
                    Continuă către plată
                  </Button>
                  <p className="text-[11px] leading-relaxed text-gray-500">
                    Prin continuare vei fi redirecționat către pagina securizată
                    de plată Stripe.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
