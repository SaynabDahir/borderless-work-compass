import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Check, Scale, Trash2, Wallet } from "lucide-react";
import { useState } from "react";

import { Field, Pill, ScoreRing } from "@/components/bits";
import { ImpactGrid } from "@/components/site-chrome";
import { money, totals } from "@/lib/invoice";
import { band, complianceScore, payScore } from "@/lib/rules";
import { SAMPLES, type Role, type SampleId } from "@/lib/samples";
import { useStore } from "@/lib/store";

const DESC = "Check work compliance, set up payouts, create compliant invoices and understand your rights — for skilled refugees and the employers who hire them.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BorderlessWork Hub — Legal & financial access for displaced talent" },
      { name: "description", content: DESC },
      { property: "og:title", content: "BorderlessWork Hub — Legal & financial access for displaced talent" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t, active, saved, load, createCase, deleteCase } = useStore();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("professional");

  const cScore = complianceScore(active.country, active.arrangement, active.doc, active.done);
  const pScore = payScore(active.country, active.pay);
  const inv = active.invoice;

  const modules = [
    { to: "/compliance", icon: BadgeCheck, title: t.ui.m1Title, desc: t.ui.m1Desc },
    { to: "/payments", icon: Wallet, title: t.ui.m2Title, desc: t.ui.m2Desc },
    { to: "/legal", icon: Scale, title: t.ui.m3Title, desc: t.ui.m3Desc },
  ] as const;

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow text-brand-strong">{t.ui.appTag}</p>
          <h1 className="mt-3 text-4xl leading-[1.05] font-extrabold text-foreground sm:text-5xl">{t.ui.heroTitle}</h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t.ui.heroSub}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/compliance" className="btn btn-primary px-5 py-3">
              {t.ui.startCheck} <ArrowRight className="size-4" />
            </Link>
            <a href="#samples" className="btn btn-outline px-5 py-3">
              {t.ui.seeSamples}
            </a>
          </div>
        </div>

        <div className="navy-panel p-6 shadow-xl sm:p-7">
          <p className="eyebrow text-brand-bright">{t.ui.snapshot}</p>
          <p className="mt-2 font-display text-xl font-semibold">{active.name}</p>
          <p className="mt-1 text-sm text-primary-foreground/70">
            {t.country[active.country]} · {t.arr[active.arrangement]}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Link to="/compliance" className="rounded-xl bg-primary-foreground/5 p-4 transition-colors hover:bg-primary-foreground/10">
              <ScoreRing value={cScore} size={104} onDark label={t.ui.readiness} />
              <p className="mt-3 text-sm font-medium">{t.ui.readiness}</p>
              <p className="text-xs text-brand-bright">{t.ui[band(cScore)]}</p>
            </Link>
            <Link to="/payments" className="rounded-xl bg-primary-foreground/5 p-4 transition-colors hover:bg-primary-foreground/10">
              <ScoreRing value={pScore} size={104} onDark label={t.ui.payReadiness} />
              <p className="mt-3 text-sm font-medium">{t.ui.payReadiness}</p>
              <p className="text-xs text-brand-bright">{t.ui[band(pScore)]}</p>
            </Link>
          </div>
          <Link
            to="/payments"
            className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-primary-foreground/5 p-4 transition-colors hover:bg-primary-foreground/10"
          >
            <div className="min-w-0">
              <p className="text-xs text-primary-foreground/70">
                {t.ui.invoiceStatus} · {inv.number}
              </p>
              <p className="truncate font-mono text-lg">{money(totals(inv).total, inv.currency)}</p>
            </div>
            <span className="rounded-full bg-brand-bright px-2.5 py-0.5 text-xs font-semibold text-primary">{t.inv[inv.status]}</span>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {modules.map((m) => (
          <Link key={m.to} to={m.to} className="card group p-6 transition-colors hover:border-brand/50">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
              <m.icon className="size-5" />
            </span>
            <h2 className="mt-4 text-xl font-semibold text-foreground">{m.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-strong">
              {t.ui.open} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section id="samples" className="scroll-mt-44">
        <h2 className="text-2xl font-bold text-foreground">{t.ui.samples}</h2>
        <p className="mt-1 text-muted-foreground">{t.ui.samplesSub}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {SAMPLES.map((s) => {
            const isActive = active.id === s.id;
            return (
              <article key={s.id} className={`card flex flex-col p-5 ${isActive ? "border-brand ring-2 ring-brand/20" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={s.role === "employer" ? "navy" : "brand"}>{t.ui[s.role]}</Pill>
                  <Pill>{t.country[s.country]}</Pill>
                  <Pill>{t.arr[s.arrangement]}</Pill>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{s.name}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{t.samples[s.id as SampleId]}</p>
                <button type="button" className={`btn mt-4 self-start ${isActive ? "btn-outline" : "btn-brand"}`} onClick={() => load(s)}>
                  {isActive && <Check className="size-4" />}
                  {isActive ? t.ui.loaded : t.ui.loadSample}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground">{t.ui.yourCases}</h2>
        <p className="mt-1 text-muted-foreground">{t.ui.yourCasesSub}</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
          <form
            className="card space-y-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              createCase(name.trim(), role);
              setName("");
            }}
          >
            <Field label={t.ui.caseName}>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
            </Field>
            <Field label={t.ui.iAm}>
              <select className="field" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="professional">{t.ui.professional}</option>
                <option value="employer">{t.ui.employer}</option>
              </select>
            </Field>
            <button type="submit" className="btn btn-primary">
              {t.ui.createCase}
            </button>
          </form>
          <div className="card p-5">
            {saved.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.ui.noCases}</p>
            ) : (
              <ul className="divide-y">
                {saved.map((c) => (
                  <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.ui[c.role]} · {t.country[c.country]} · {t.arr[c.arrangement]}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button" className="btn btn-outline py-1.5" onClick={() => load(c)} disabled={active.id === c.id}>
                        {active.id === c.id ? t.ui.loaded : t.ui.open}
                      </button>
                      <button type="button" className="btn btn-outline px-2 py-1.5 text-destructive" onClick={() => deleteCase(c.id)} aria-label={`${t.ui.del}: ${c.name}`}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="navy-panel p-6 sm:p-10">
        <p className="eyebrow text-brand-bright">{t.ui.track}</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{t.ui.impactTitle}</h2>
        <p className="mt-2 mb-6 max-w-2xl text-primary-foreground/75">{t.ui.impactSub}</p>
        <ImpactGrid />
      </section>
    </div>
  );
}
