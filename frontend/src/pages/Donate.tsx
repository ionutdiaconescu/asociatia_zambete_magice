import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { useCampaigns } from "../hooks/useCampaigns";
import { resolveCmsApiConfig } from "../services/cmsConfig";
import { Section } from "../components/ui/Section";
import { Meta } from "../components/seo/Meta";
import { getActiveCampaigns } from "../utils/campaign";
import { buildWebPageMeta } from "../utils/seo";
import { Alert } from "../components/ui/Alert";

const PRESET_AMOUNTS = [25, 50, 100, 250];
const { apiBase } = resolveCmsApiConfig();

interface PaymentsStatus {
  ready: boolean;
  checkoutEnabled: boolean;
  webhookConfigured: boolean;
  currency: string;
  mode: "live" | "test" | "unconfigured";
  message: string;
}

export default function Donate() {
  const [searchParams] = useSearchParams();
  const { data: campaigns, loading: campaignsLoading } = useCampaigns();
  const activeCampaigns = getActiveCampaigns(campaigns);
  const [amount, setAmount] = useState<number | "">("");
  const [custom, setCustom] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [paymentsStatus, setPaymentsStatus] = useState<PaymentsStatus | null>(
    null,
  );
  const [paymentsStatusLoading, setPaymentsStatusLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPaymentsStatus = async () => {
      setPaymentsStatusLoading(true);
      try {
        const res = await fetch(`${apiBase}/payments/status`);
        if (!res.ok) throw new Error("Nu am putut verifica statusul plăților");
        const data = (await res.json()) as PaymentsStatus;
        if (active) {
          setPaymentsStatus(data);
        }
      } catch (error) {
        console.error(error);
        if (active) {
          setPaymentsStatus({
            ready: false,
            checkoutEnabled: false,
            webhookConfigured: false,
            currency: "RON",
            mode: "unconfigured",
            message: "Plata cu cardul este indisponibilă temporar.",
          });
        }
      } finally {
        if (active) {
          setPaymentsStatusLoading(false);
        }
      }
    };

    loadPaymentsStatus();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!activeCampaigns.length) {
      setSelectedCampaignId("");
      return;
    }

    const requestedCampaignId = searchParams.get("campaign")?.trim();
    if (
      requestedCampaignId &&
      activeCampaigns.some((campaign) => campaign.id === requestedCampaignId)
    ) {
      setSelectedCampaignId(requestedCampaignId);
      return;
    }

    setSelectedCampaignId((current) => {
      if (
        current &&
        activeCampaigns.some((campaign) => campaign.id === current)
      ) {
        return current;
      }
      return activeCampaigns[0].id;
    });
  }, [activeCampaigns, searchParams]);

  const selectedCampaign =
    activeCampaigns.find((campaign) => campaign.id === selectedCampaignId) ??
    null;
  const cardPaymentsReady = paymentsStatus?.ready === true;
  const seo = buildWebPageMeta({
    title: "Donează",
    path: "/donate",
    description:
      "Doneaza online pentru campaniile active ale asociatiei Zambete Magice.",
  });

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
    if (
      !amount ||
      amount <= 0 ||
      !selectedCampaignId ||
      !donorEmail.trim() ||
      !cardPaymentsReady
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          campaignId: Number(selectedCampaignId),
          donorEmail: donorEmail.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Checkout session failed",
        );
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Missing session URL");
      }
    } catch (e) {
      console.error(e);
      alert(
        e instanceof Error ? e.message : "A apărut o eroare. Încearcă din nou.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[linear-gradient(180deg,#fff9f2_0%,#ffffff_42%,#fff8ef_100%)]">
      <Meta
        title="Donează"
        description="Donează online și susține una dintre campaniile active ale asociației Zâmbete Magice."
        canonical={seo.canonical}
        jsonLd={seo.jsonLd}
      />
      <Section
        title="Donează"
        description="Sprijină activitățile noastre și ajută-ne să aducem zâmbete copiilor. Alege o sumă sau introdu una personalizată."
        className="pt-16"
      >
        <div className="grid items-start gap-6 md:grid-cols-5 lg:gap-8">
          <div className="md:col-span-3 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Alege campania</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Campania pentru care donezi
                  </label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    disabled={campaignsLoading || !activeCampaigns.length}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-400"
                  >
                    {!activeCampaigns.length ? (
                      <option value="">
                        Nu există campanii active pentru donații online.
                      </option>
                    ) : (
                      activeCampaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.title}
                        </option>
                      ))
                    )}
                  </select>
                  {selectedCampaign && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-slate-700">
                      <div className="font-semibold text-slate-900">
                        {selectedCampaign.title}
                      </div>
                      <p className="mt-1 leading-relaxed text-slate-600">
                        {selectedCampaign.shortDescription}
                      </p>
                    </div>
                  )}
                  {!campaignsLoading && !activeCampaigns.length && (
                    <p className="text-sm text-slate-500">
                      Donațiile online sunt disponibile doar pentru campaniile
                      active.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
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
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          active
                            ? "bg-gradient-to-r from-amber-700 to-rose-700 text-white border-transparent shadow"
                            : "border-slate-300 text-slate-700 hover:border-amber-500 hover:text-amber-800"
                        }`}
                      >
                        {v} RON
                      </button>
                    );
                  })}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Suma personalizată"
                      value={custom}
                      onChange={onCustomChange}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-400 sm:w-44"
                    />
                    {custom && amount !== "" && (
                      <span className="text-xs text-slate-500">RON</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Date pentru confirmare</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="donor-email"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Email
                    </label>
                    <input
                      id="donor-email"
                      type="email"
                      autoComplete="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="nume@exemplu.ro"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <ul className="list-disc pl-5 text-sm space-y-2 marker:text-amber-700">
                    <li>Donațiile susțin programe educaționale și sociale.</li>
                    <li>
                      Emailul este folosit pentru confirmarea plății Stripe.
                    </li>
                    <li>Poți alege campania și suma înainte de redirect.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6 md:col-span-2 lg:sticky lg:top-28">
            <Card className="border-amber-100 bg-gradient-to-b from-white to-amber-50/40">
              <CardHeader>
                <CardTitle>Rezumat donație</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!paymentsStatusLoading &&
                    paymentsStatus &&
                    !cardPaymentsReady && (
                      <Alert
                        title="Plata cu cardul nu este activă încă"
                        variant="warning"
                      >
                        {paymentsStatus.message} După ce adaugi contul Stripe și
                        cheile de producție, această pagină va putea trimite
                        direct către checkout.
                      </Alert>
                    )}
                  {!paymentsStatusLoading &&
                    paymentsStatus?.mode === "test" &&
                    cardPaymentsReady && (
                      <Alert title="Mod test activ" variant="info">
                        Checkout-ul este pregătit în modul de test Stripe. Poți
                        verifica fluxul, dar nu încasa plăți reale până nu
                        conectezi contul final.
                      </Alert>
                    )}
                  <div className="flex flex-col gap-1 text-sm text-slate-700 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <span>Campanie</span>
                    <span className="font-semibold text-slate-900 break-words sm:max-w-[14rem] sm:text-right">
                      {selectedCampaign?.title || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
                    <span>Suma selectată</span>
                    <span className="font-semibold">
                      {amount ? `${amount} RON` : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
                    <span>Comision procesare (estimativ)</span>
                    <span className="text-slate-500">Inclus</span>
                  </div>
                  <hr className="border-slate-200" />
                  <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
                    <span>Total</span>
                    <span className="font-bold text-slate-900">
                      {amount ? `${amount} RON` : "-"}
                    </span>
                  </div>
                  <Button
                    onClick={handleDonate}
                    disabled={
                      !amount ||
                      !selectedCampaignId ||
                      !donorEmail.trim() ||
                      paymentsStatusLoading ||
                      !cardPaymentsReady ||
                      campaignsLoading ||
                      !activeCampaigns.length
                    }
                    loading={loading}
                    className="w-full mt-2"
                  >
                    {paymentsStatusLoading
                      ? "Verificăm plățile..."
                      : cardPaymentsReady
                        ? "Continuă către plată"
                        : "Plata cu cardul va fi activată curând"}
                  </Button>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    {cardPaymentsReady
                      ? "Prin continuare vei fi redirecționat către pagina securizată de plată Stripe."
                      : "Fluxul este pregătit și va deveni activ in scurt timp."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
}
