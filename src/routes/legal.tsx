import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSignature, Landmark, ShieldCheck, Stamp } from "lucide-react";
import { useState } from "react";

import { CheckRow, PageHeader } from "@/components/bits";
import { fmt, type Dict } from "@/i18n";
import { downloadText } from "@/lib/download";
import type { ScenarioId } from "@/lib/samples";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const DESC = "Plain-language labour rights, contracting rules and payment protection for refugees, with a scenario resolver in four languages.";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Multilingual Legal Assistant — BorderlessWork Hub" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Multilingual Legal Assistant — BorderlessWork Hub" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LegalPage,
});

type CatId = keyof Dict["legal"]["cats"];
const CATS: { id: CatId; icon: typeof Stamp }[] = [
  { id: "auth", icon: Stamp },
  { id: "contract", icon: FileSignature },
  { id: "tax", icon: Landmark },
  { id: "rights", icon: ShieldCheck },
];
const SCENARIOS: ScenarioId[] = ["late", "nocontract", "refused", "kyc", "expiry"];

function LegalPage() {
  const { t, active, update } = useStore();
  const [cat, setCat] = useState<CatId>("auth");
  const current = t.legal.cats[cat];
  const scenario = t.legal.scenarios[active.scenario];
  const key = (i: number) => `${active.scenario}:${i}`;
  const doneCount = scenario.steps.filter((_, i) => active.scenarioDone.includes(key(i))).length;

  const checklist = () =>
    [
      `BorderlessWork Hub — ${scenario.title}`,
      `${t.ui.activeCase}: ${active.name}`,
      "",
      t.ui.actionSteps,
      ...scenario.steps.map((s, i) => `[${active.scenarioDone.includes(key(i)) ? "x" : " "}] ${i + 1}. ${s}`),
      "",
      t.ui.disclaimer,
    ].join("\n");

  return (
    <div>
      <PageHeader eyebrow={t.nav.legal} title={t.ui.m3Title} sub={t.ui.m3Desc} />

      <section>
        <h2 className="text-2xl font-bold text-foreground">{t.ui.guide}</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4" role="tablist">
          {CATS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={cat === c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border p-3 text-left text-sm font-semibold transition-colors",
                cat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              <c.icon className={cn("size-5 shrink-0", cat === c.id ? "text-brand-bright" : "text-brand-strong")} />
              <span className="min-w-0">{t.legal.cats[c.id].title}</span>
            </button>
          ))}
        </div>
        <div className="card mt-4 p-5 sm:p-6" role="tabpanel">
          <h3 className="text-xl font-semibold text-foreground">{current.title}</h3>
          <ol className="mt-4 space-y-4">
            {current.points.map((p, i) => (
              <li key={i} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-soft font-mono text-xs font-medium text-brand-strong">{i + 1}</span>
                <span className="leading-relaxed text-foreground">{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-foreground">{t.ui.scenarioTitle}</h2>
        <p className="mt-1 text-muted-foreground">{t.ui.scenarioSub}</p>
        <div className="mt-5 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-2">
            {SCENARIOS.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={active.scenario === s}
                onClick={() => update({ scenario: s })}
                className={cn(
                  "w-full rounded-xl border p-3.5 text-left text-sm font-medium transition-colors",
                  active.scenario === s ? "border-brand bg-brand-soft text-accent-foreground" : "border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                {t.legal.scenarios[s].title}
              </button>
            ))}
          </div>
          <div className="card min-w-0 p-5 sm:p-6">
            <p className="eyebrow text-brand-strong">{t.ui.actionSteps}</p>
            <h3 className="mt-1 text-xl font-semibold text-foreground" data-testid="scenario-title">
              {scenario.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{fmt(t.ui.progress, { done: doneCount, total: scenario.steps.length })}</p>
            <div className="mt-4 space-y-2">
              {scenario.steps.map((s, i) => (
                <CheckRow
                  key={key(i)}
                  checked={active.scenarioDone.includes(key(i))}
                  onChange={(v) =>
                    update({ scenarioDone: v ? [...active.scenarioDone, key(i)] : active.scenarioDone.filter((d) => d !== key(i)) })
                  }
                >
                  <span className="font-mono text-xs text-muted-foreground">{i + 1}. </span>
                  {s}
                </CheckRow>
              ))}
            </div>
            <button type="button" className="btn btn-primary mt-5" onClick={() => downloadText(`checklist-${active.scenario}.txt`, checklist())}>
              <Download className="size-4" /> {t.ui.downloadChecklist}
            </button>
          </div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">{t.ui.disclaimer}</p>
      </section>
    </div>
  );
}
