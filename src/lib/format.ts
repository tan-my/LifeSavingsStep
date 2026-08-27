const fullFormatter = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Full currency, e.g. "RM48,200" — for hero numbers, tooltips, table cells. */
export function formatCurrency(amount: number): string {
  return fullFormatter.format(amount);
}

/** Compact currency, e.g. "RM48.2K" — for axis ticks where space is tight. */
export function formatCurrencyCompact(amount: number): string {
  return compactFormatter.format(amount);
}
