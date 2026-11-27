import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Building2, ClipboardCopy, Download } from "lucide-react";
import { useState } from "react";

import { CheckRow, PageHeader, ScoreRing, Select } from "@/components/bits";
import { fmt } from "@/i18n";
import { copyText, downloadText } from "@/lib/download";
import {
  ARRANGEMENTS,
  COUNTRIES,
  DOC_STATUSES,
  band,
  complianceScore,
  getAlerts,
  getEmployerGuidance,
  getSteps,
} from "@/lib/rules";
import type { Role } from "@/lib/samples";
import { useStore } from "@/lib/store";

const DESC = "Choose a host country, work arrangement and document status to get a readiness score, required legal steps and employer guidance.";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Hiring Compliance Copilot — BorderlessWork Hub" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Hiring Compliance Copilot — BorderlessWork Hub" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompliancePage,
});

function CompliancePage() {
  const { t, active, update } = useStore();
  const [copied, setCopied] = useState(false);
  const { country, arrangement, doc } = active;

  const steps = getSteps(country, arrangement, doc);
  const doneCount = steps.filter((s) => active.done.includes(s)).length;
  const score = complianceScore(country, arrangement, doc, active.done);
  const alerts = getAlerts(country, arrangement, doc);
  const guidance = getEmployerGuidance(country, arrangement);

  const toggle = (id: string, on: boolean) =>
    update({ done: on ? [...active.done, id] : active.done.filter((d) => d !== id) });

  const summary = () =>
    [
      `BorderlessWork Hub — ${t.ui.summaryTitle}`,
      `${t.ui.activeCase}: ${active.name} (${t.ui[active.role]})`,
      `${t.ui.hostCountry}: ${t.country[country]}`,
      `${t.ui.arrangement}: ${t.arr[arrangement]}`,
      `${t.ui.docStatus}: ${t.doc[doc]}`,
      `${t.ui.readiness}: ${score}/100 (${t.ui[band(score)]})`,
      "",
      `${t.ui.legalSteps} — ${fmt(t.ui.progress, { done: doneCount, total: steps.length })}`,
      ...steps.map((s) => `[${active.done.includes(s) ? "x" : " "}] ${t.steps[s]}`),
      ...(alerts.length ? ["", t.ui.watchOut, ...alerts.map((a) => `! ${t.alerts[a]}`)] : []),
      "",
      t.ui.employerGuide,
      ...guidance.map((g) => `- ${t.employer[g]}`),
      "",
      t.ui.disclaimer,
    ].join("\n");

  const checklist = (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold text-foreground">{t.ui.legalSteps}</h2>
        <p className="text-sm text-muted-foreground">{fmt(t.ui.progress, { done: doneCount, total: steps.length })}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>
      <div className="mt-4 space-y-2">
        {steps.map((s) => (
          <CheckRow key={s} checked={active.done.includes(s)} onChange={(v) => toggle(s, v)}>
            {t.steps[s]}
          </CheckRow>
        ))}
      </div>
    </section>
  );

  const employer = (
    <section className="card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
        <Building2 className="size-5 text-brand-strong" /> {t.ui.employerGuide}
      </h2>
      <ul className="mt-4 space-y-3 text-sm text-foreground">
        {guidance.map((g) => (
          <li key={g} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
            <span className="mt-1.5 size-1.5 rounded-full bg-brand" aria-hidden />
            <span className="leading-relaxed">{t.employer[g]}</span>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <div>
      <PageHeader eyebrow={t.nav.compliance} title={t.ui.m1Title} sub={t.ui.m1Desc} />
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="card space-y-4 p-5">
            <Select<Role>
              label={t.ui.iAm}
              value={active.role}
              onChange={(role) => update({ role })}
              options={[
                { value: "professional", label: t.ui.professional },
                { value: "employer", label: t.ui.employer },
              ]}
            />
            <Select label={t.ui.hostCountry} value={country} onChange={(v) => update({ country: v })} options={COUNTRIES.map((c) => ({ value: c, label: t.country[c] }))} />
            <Select label={t.ui.arrangement} value={arrangement} onChange={(v) => update({ arrangement: v })} options={ARRANGEMENTS.map((a) => ({ value: a, label: t.arr[a] }))} />
            <Select label={t.ui.docStatus} value={doc} onChange={(v) => update({ doc: v })} options={DOC_STATUSES.map((d) => ({ value: d, label: t.doc[d] }))} />
          </section>

          <section className="navy-panel p-5">
            <div className="flex items-center gap-4">
              <ScoreRing value={score} size={112} onDark label={t.ui.readiness} />
              <div className="min-w-0">
                <p className="text-sm text-primary-foreground/75">{t.ui.readiness}</p>
                <p className="font-display text-2xl font-bold text-brand-bright" data-testid="compliance-band">
                  {t.ui[band(score)]}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-brand"
                onClick={async () => {
                  if (await copyText(summary())) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
              >
                <ClipboardCopy className="size-4" /> {copied ? t.ui.copied : t.ui.copy}
              </button>
              <button
                type="button"
                className="btn border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => downloadText("compliance-summary.txt", summary())}
              >
                <Download className="size-4" /> {t.ui.download}
              </button>
            </div>
          </section>

          {alerts.length > 0 && (
            <section className="rounded-2xl border border-warn/25 bg-warn-soft p-5 text-warn">
              <h2 className="flex items-center gap-2 font-sans text-sm font-bold tracking-normal">
                <AlertTriangle className="size-4" /> {t.ui.watchOut}
              </h2>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                {alerts.map((a) => (
                  <li key={a}>{t.alerts[a]}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          {active.role === "employer" ? (
            <>
              {employer}
              {checklist}
            </>
          ) : (
            <>
              {checklist}
              {employer}
            </>
          )}
          <p className="text-xs text-muted-foreground">{t.ui.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
