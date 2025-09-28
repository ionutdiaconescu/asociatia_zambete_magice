const RON = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "RON",
  minimumFractionDigits: 0,
});
const NUMBER = new Intl.NumberFormat("ro-RO");

export function formatRON(value: number | null | undefined) {
  if (value == null || isNaN(value)) return "-";
  return RON.format(value);
}

export function formatNumber(value: number | null | undefined) {
  if (value == null || isNaN(value)) return "-";
  return NUMBER.format(value);
}

export function formatPercent(part: number, total: number) {
  if (!total || total <= 0) return "0%";
  return Math.min(100, Math.round((part / total) * 100)) + "%";
}

export function truncate(text: string, max = 120) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}
