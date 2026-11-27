import type { Dict } from "@/i18n/en";

export type Currency = "USD" | "KES" | "EUR" | "UGX";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export const CURRENCIES: Currency[] = ["USD", "KES", "EUR", "UGX"];
export const STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];

export type LineItem = { id: string; desc: string; qty: number; rate: number };
export type Invoice = {
  id: string;
  number: string;
  issue: string;
  due: string;
  currency: Currency;
  fromName: string;
  fromAddress: string;
  fromTaxId: string;
  toName: string;
  toAddress: string;
  items: LineItem[];
  taxRate: number;
  notes: string;
  payTo: string;
  status: InvoiceStatus;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function totals(inv: Pick<Invoice, "items" | "taxRate">) {
  const subtotal = round2(inv.items.reduce((n, i) => n + i.qty * i.rate, 0));
  const tax = round2((subtotal * inv.taxRate) / 100);
  return { subtotal, tax, total: round2(subtotal + tax) };
}

export function money(n: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "code" }).format(n);
}

export function invoiceText(inv: Invoice, t: Dict): string {
  const L = t.inv;
  const { subtotal, tax, total } = totals(inv);
  return [
    `${L.invoice} ${inv.number}`,
    `${L.issue}: ${inv.issue}    ${L.due}: ${inv.due}    ${L.status}: ${L[inv.status]}`,
    "",
    `${L.from}`,
    inv.fromName,
    inv.fromAddress,
    inv.fromTaxId ? `${L.taxId}: ${inv.fromTaxId}` : "",
    "",
    `${L.to}`,
    inv.toName,
    inv.toAddress,
    "",
    `${L.items}`,
    ...inv.items.map(
      (i) => `- ${i.desc} | ${i.qty} x ${money(i.rate, inv.currency)} = ${money(i.qty * i.rate, inv.currency)}`,
    ),
    "",
    `${L.subtotal}: ${money(subtotal, inv.currency)}`,
    `${L.tax} (${inv.taxRate}%): ${money(tax, inv.currency)}`,
    `${L.total}: ${money(total, inv.currency)}`,
    "",
    `${L.payTo}: ${inv.payTo}`,
    inv.notes ? `${L.notes}: ${inv.notes}` : "",
    "",
    L.complianceNote,
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");
}
