import { createFileRoute } from "@tanstack/react-router";
import { Download, FilePlus2, Plus, Printer, Save, Trash2 } from "lucide-react";
import { useState } from "react";

import { CheckRow, Field, PageHeader, Pill, ScoreRing } from "@/components/bits";
import { fmt, type Dict } from "@/i18n";
import { downloadText, uid } from "@/lib/download";
import { CURRENCIES, STATUSES, invoiceText, money, totals, type Currency, type Invoice, type InvoiceStatus, type LineItem } from "@/lib/invoice";
import { TAX_ID_NAME, band, getRails, payKeys, payScore } from "@/lib/rules";
import { blankInvoice } from "@/lib/samples";
import { useStore } from "@/lib/store";

const DESC = "Check which payout routes are open to you and create, preview and export a compliant international contractor invoice.";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payment Readiness & Invoicing — BorderlessWork Hub" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Payment Readiness & Invoicing — BorderlessWork Hub" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentsPage,
});

const STATUS_TONE: Record<InvoiceStatus, "muted" | "navy" | "brand" | "danger"> = {
  draft: "muted",
  sent: "navy",
  paid: "brand",
  overdue: "danger",
};

function PaymentsPage() {
  const { t, active, update } = useStore();
  const [savedFlash, setSavedFlash] = useState(false);
  const { country, pay, invoice: inv, tracker } = active;

  const keys = payKeys(country);
  const score = payScore(country, pay);
  const rails = getRails(country, pay);
  const missing = keys.filter((k) => !pay[k]);
  const taxId = TAX_ID_NAME[country] ?? t.ui.taxLocal;

  const setInv = (patch: Partial<Invoice>) => update({ invoice: { ...inv, ...patch } });
  const setItem = (id: string, patch: Partial<LineItem>) =>
    setInv({ items: inv.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });

  const saveToTracker = () => {
    const exists = tracker.some((x) => x.id === inv.id);
    update({ tracker: exists ? tracker.map((x) => (x.id === inv.id ? inv : x)) : [...tracker, inv] });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const newInvoice = () => {
    const today = new Date().toISOString().slice(0, 10);
    const next = blankInvoice(uid(), `INV-${String(tracker.length + 2).padStart(3, "0")}`, today);
    update({
      invoice: { ...next, currency: inv.currency, fromName: inv.fromName, fromAddress: inv.fromAddress, fromTaxId: inv.fromTaxId, payTo: inv.payTo },
    });
  };

  const setTrackerStatus = (id: string, status: InvoiceStatus) =>
    update({
      tracker: tracker.map((x) => (x.id === id ? { ...x, status } : x)),
      ...(inv.id === id ? { invoice: { ...inv, status } } : {}),
    });

  const num = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  return (
    <div>
      <PageHeader eyebrow={t.nav.payments} title={t.ui.m2Title} sub={t.ui.m2Desc} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="card p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-foreground">{t.ui.payDiag}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.ui.payDiagSub}</p>
          <div className="mt-4 space-y-2">
            {keys.map((k) => (
              <CheckRow key={k} checked={pay[k]} onChange={(v) => update({ pay: { ...pay, [k]: v } })}>
                {t.pay.items[k]}
                {k === "tax" && <span className="text-muted-foreground"> ({taxId})</span>}
              </CheckRow>
            ))}
          </div>
        </section>

        <div className="min-w-0 space-y-6">
          <section className="navy-panel flex items-center gap-5 p-5">
            <ScoreRing value={score} size={112} onDark label={t.ui.payReadiness} />
            <div className="min-w-0">
              <p className="text-sm text-primary-foreground/75">{t.ui.payReadiness}</p>
              <p className="font-display text-2xl font-bold text-brand-bright" data-testid="pay-band">
                {t.ui[band(score)]}
              </p>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">{fmt(t.ui.rails, { country: t.country[country] })}</h2>
            <ul className="mt-3 divide-y">
              {rails.map((r) => (
                <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{t.pay.railName[r.id]}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{t.pay.railNote[r.id]}</p>
                  </div>
                  <Pill tone={r.ready ? "brand" : "warn"}>{r.ready ? t.ui.railReady : t.ui.railSetup}</Pill>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">{t.ui.nextActions}</h2>
            {missing.length === 0 ? (
              <p className="mt-2 text-sm text-brand-strong">{t.ui.allSet}</p>
            ) : (
              <ol className="mt-3 space-y-2 text-sm text-foreground">
                {missing.map((k, i) => (
                  <li key={k} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                    <span className="flex size-6 items-center justify-center rounded-full bg-brand-soft font-mono text-xs font-medium text-brand-strong">{i + 1}</span>
                    <span className="leading-relaxed">{fmt(t.pay.fixes[k], { taxId })}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>

      <h2 className="mt-14 mb-5 text-2xl font-bold text-foreground">{t.ui.invoiceGen}</h2>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="card space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.inv.number}>
              <input className="field" value={inv.number} onChange={(e) => setInv({ number: e.target.value })} />
            </Field>
            <Field label={t.inv.currency}>
              <select className="field" value={inv.currency} onChange={(e) => setInv({ currency: e.target.value as Currency })}>
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label={t.inv.issue}>
              <input type="date" className="field" value={inv.issue} onChange={(e) => setInv({ issue: e.target.value })} />
            </Field>
            <Field label={t.inv.due}>
              <input type="date" className="field" value={inv.due} onChange={(e) => setInv({ due: e.target.value })} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset className="space-y-3">
              <legend className="mb-2 text-sm font-semibold text-foreground">{t.inv.from}</legend>
              <Field label={t.inv.name}>
                <input className="field" value={inv.fromName} onChange={(e) => setInv({ fromName: e.target.value })} />
              </Field>
              <Field label={t.inv.address}>
                <input className="field" value={inv.fromAddress} onChange={(e) => setInv({ fromAddress: e.target.value })} />
              </Field>
              <Field label={`${t.inv.taxId} (${taxId})`}>
                <input className="field" value={inv.fromTaxId} onChange={(e) => setInv({ fromTaxId: e.target.value })} />
              </Field>
            </fieldset>
            <fieldset className="space-y-3">
              <legend className="mb-2 text-sm font-semibold text-foreground">{t.inv.to}</legend>
              <Field label={t.inv.name}>
                <input className="field" value={inv.toName} onChange={(e) => setInv({ toName: e.target.value })} />
              </Field>
              <Field label={t.inv.address}>
                <input className="field" value={inv.toAddress} onChange={(e) => setInv({ toAddress: e.target.value })} />
              </Field>
            </fieldset>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-foreground">{t.inv.items}</legend>
            <div className="space-y-3">
              {inv.items.map((it) => (
                <div key={it.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-xl border bg-muted/40 p-3 sm:grid-cols-[minmax(0,1fr)_5rem_7rem_auto] sm:items-end">
                  <Field label={t.inv.desc} className="col-span-2 sm:col-span-1">
                    <input className="field" value={it.desc} onChange={(e) => setItem(it.id, { desc: e.target.value })} />
                  </Field>
                  <div className="col-span-2 grid grid-cols-2 gap-2 sm:contents">
                    <Field label={t.inv.qty}>
                      <input type="number" min="0" step="any" className="field" value={it.qty} onChange={(e) => setItem(it.id, { qty: num(e.target.value) })} />
                    </Field>
                    <Field label={t.inv.rate}>
                      <input type="number" min="0" step="any" className="field" value={it.rate} onChange={(e) => setItem(it.id, { rate: num(e.target.value) })} />
                    </Field>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline col-span-2 px-2.5 text-destructive sm:col-span-1"
                    aria-label={`${t.inv.remove}: ${it.desc}`}
                    disabled={inv.items.length === 1}
                    onClick={() => setInv({ items: inv.items.filter((x) => x.id !== it.id) })}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-outline mt-3" onClick={() => setInv({ items: [...inv.items, { id: uid(), desc: "", qty: 1, rate: 0 }] })}>
              <Plus className="size-4" /> {t.inv.addItem}
            </button>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.inv.taxRate}>
              <input type="number" min="0" max="100" step="any" className="field" value={inv.taxRate} onChange={(e) => setInv({ taxRate: Math.min(100, num(e.target.value)) })} />
            </Field>
            <Field label={t.inv.status}>
              <select className="field" value={inv.status} onChange={(e) => setInv({ status: e.target.value as InvoiceStatus })}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t.inv[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t.inv.payTo} className="sm:col-span-2">
              <input className="field" value={inv.payTo} onChange={(e) => setInv({ payTo: e.target.value })} />
            </Field>
            <Field label={t.inv.notes} className="sm:col-span-2">
              <textarea className="field" rows={2} value={inv.notes} onChange={(e) => setInv({ notes: e.target.value })} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-5">
            <button type="button" className="btn btn-primary" onClick={() => window.print()}>
              <Printer className="size-4" /> {t.inv.print}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => downloadText(`${inv.number || "invoice"}.txt`, invoiceText(inv, t))}>
              <Download className="size-4" /> {t.inv.downloadTxt}
            </button>
            <button type="button" className="btn btn-brand" onClick={saveToTracker}>
              <Save className="size-4" /> {savedFlash ? t.inv.saved : t.inv.save}
            </button>
            <button type="button" className="btn btn-outline" onClick={newInvoice}>
              <FilePlus2 className="size-4" /> {t.inv.newInv}
            </button>
          </div>
        </section>

        <div className="min-w-0">
          <p className="eyebrow mb-2 text-muted-foreground print:hidden">{t.inv.preview}</p>
          <InvoicePreview inv={inv} t={t} />
        </div>
      </div>

      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">{t.inv.tracker}</h2>
        {tracker.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t.inv.trackerEmpty}</p>
        ) : (
          <ul className="mt-3 divide-y">
            {tracker.map((x) => (
              <li key={x.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {x.number} · {x.toName || t.inv.client}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.inv.due}: {x.due}
                  </p>
                </div>
                <p className="font-mono text-sm text-foreground">{money(totals(x).total, x.currency)}</p>
                <select
                  aria-label={`${t.inv.status}: ${x.number}`}
                  className="field w-auto py-1.5"
                  value={x.status}
                  onChange={(e) => setTrackerStatus(x.id, e.target.value as InvoiceStatus)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t.inv[s]}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-outline py-1.5" onClick={() => update({ invoice: x })}>
                    {t.inv.edit}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline px-2 py-1.5 text-destructive"
                    aria-label={`${t.ui.del}: ${x.number}`}
                    onClick={() => update({ tracker: tracker.filter((y) => y.id !== x.id) })}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function InvoicePreview({ inv, t }: { inv: Invoice; t: Dict }) {
  const L = t.inv;
  const { subtotal, tax, total } = totals(inv);
  return (
    <article className="print-area card p-6 text-sm text-foreground sm:p-8" data-testid="invoice-preview">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
        <div>
          <p className="font-display text-2xl font-bold tracking-tight">{L.invoice}</p>
          <p className="mt-1 font-mono text-muted-foreground">{inv.number}</p>
        </div>
        <div className="text-right">
          <Pill tone={STATUS_TONE[inv.status]}>{L[inv.status]}</Pill>
          <p className="mt-2 text-muted-foreground">
            {L.issue}: <span className="font-mono text-foreground">{inv.issue}</span>
          </p>
          <p className="text-muted-foreground">
            {L.due}: <span className="font-mono text-foreground">{inv.due}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-5 py-5 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="eyebrow text-muted-foreground">{L.from}</p>
          <p className="mt-1 font-semibold">{inv.fromName || "—"}</p>
          <p className="text-muted-foreground">{inv.fromAddress}</p>
          {inv.fromTaxId && (
            <p className="text-muted-foreground">
              {L.taxId}: {inv.fromTaxId}
            </p>
          )}
        </div>
        <div className="min-w-0">
          <p className="eyebrow text-muted-foreground">{L.to}</p>
          <p className="mt-1 font-semibold">{inv.toName || "—"}</p>
          <p className="text-muted-foreground">{inv.toAddress}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[26rem] text-left">
          <thead>
            <tr className="border-y bg-muted/60 text-xs text-muted-foreground">
              <th className="px-2 py-2 font-semibold">{L.desc}</th>
              <th className="px-2 py-2 text-right font-semibold">{L.qty}</th>
              <th className="px-2 py-2 text-right font-semibold">{L.rate}</th>
              <th className="px-2 py-2 text-right font-semibold">{L.amount}</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="px-2 py-2.5">{i.desc || "—"}</td>
                <td className="px-2 py-2.5 text-right font-mono">{i.qty}</td>
                <td className="px-2 py-2.5 text-right font-mono whitespace-nowrap">{money(i.rate, inv.currency)}</td>
                <td className="px-2 py-2.5 text-right font-mono whitespace-nowrap">{money(i.qty * i.rate, inv.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-4 ml-auto grid max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-1.5">
        <dt className="text-muted-foreground">{L.subtotal}</dt>
        <dd className="text-right font-mono">{money(subtotal, inv.currency)}</dd>
        <dt className="text-muted-foreground">
          {L.tax} ({inv.taxRate}%)
        </dt>
        <dd className="text-right font-mono">{money(tax, inv.currency)}</dd>
        <dt className="border-t pt-2 font-semibold">{L.total}</dt>
        <dd className="border-t pt-2 text-right font-mono text-base font-semibold" data-testid="invoice-total">
          {money(total, inv.currency)}
        </dd>
      </dl>

      <div className="mt-6 space-y-3 border-t pt-4">
        {inv.payTo && (
          <p>
            <span className="font-semibold">{L.payTo}: </span>
            {inv.payTo}
          </p>
        )}
        {inv.notes && (
          <p>
            <span className="font-semibold">{L.notes}: </span>
            {inv.notes}
          </p>
        )}
        <p className="text-xs leading-relaxed text-muted-foreground">{L.complianceNote}</p>
      </div>
    </article>
  );
}
