import { Link } from "@tanstack/react-router";
import { Globe } from "lucide-react";

import { LANGS, type Lang } from "@/i18n";
import { SAMPLES } from "@/lib/samples";
import { useStore } from "@/lib/store";
import { Logo, Pill } from "./bits";

const NAV = [
  { to: "/", key: "home" },
  { to: "/compliance", key: "compliance" },
  { to: "/payments", key: "payments" },
  { to: "/legal", key: "legal" },
] as const;

export function SiteHeader() {
  const { t, lang, setLang, active, saved, load, saveCopy } = useStore();
  const all = [...SAMPLES, ...saved];

  return (
    <header className="top-0 z-40 border-b lg:sticky bg-background/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <Logo className="size-8 shrink-0" />
          <span className="truncate font-display text-lg font-bold tracking-tight text-foreground">
            BorderlessWork <span className="text-brand">Hub</span>
          </span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main">
          <NavLinks />
        </nav>
        <label className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border border-input bg-card px-2 py-1.5 text-sm">
          <Globe className="size-4 text-muted-foreground" aria-hidden />
          <span className="sr-only">{t.ui.language}</span>
          <select
            aria-label={t.ui.language}
            className="bg-transparent font-medium text-foreground outline-hidden"
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t px-3 py-2 lg:hidden" aria-label="Main">
        <NavLinks />
      </nav>
      <div className="border-t bg-secondary/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6">
          <span className="eyebrow text-muted-foreground">{t.ui.activeCase}</span>
          <select
            aria-label={t.ui.activeCase}
            className="field min-w-0 flex-1 py-1.5 sm:max-w-md"
            value={active.id}
            onChange={(e) => {
              const c = all.find((x) => x.id === e.target.value);
              if (c) load(c);
            }}
          >
            {all.map((c) => (
              <option key={c.id} value={c.id}>
                {c.custom ? `${t.ui.custom}: ` : `${t.ui.sample}: `}
                {c.name}
              </option>
            ))}
          </select>
          <Pill tone={active.role === "employer" ? "navy" : "brand"}>{t.ui[active.role]}</Pill>
          {!active.custom && (
            <button type="button" className="btn btn-outline py-1.5" onClick={saveCopy}>
              {t.ui.saveCopy}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLinks() {
  const { t } = useStore();
  return (
    <>
      {NAV.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          activeOptions={{ exact: true }}
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          activeProps={{ className: "bg-accent text-accent-foreground" }}
        >
          {t.nav[n.key]}
        </Link>
      ))}
    </>
  );
}

export function ImpactGrid() {
  const { t } = useStore();
  const sdgs = [
    { n: 8, title: t.ui.sdg8, desc: t.ui.sdg8d },
    { n: 10, title: t.ui.sdg10, desc: t.ui.sdg10d },
    { n: 16, title: t.ui.sdg16, desc: t.ui.sdg16d },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {sdgs.map((s) => (
        <div key={s.n} className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-4">
          <p className="font-mono text-xs text-brand-bright">SDG {s.n}</p>
          <p className="mt-1 font-display text-lg font-semibold">{s.title}</p>
          <p className="mt-1 text-sm text-primary-foreground/75">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}

export function SiteFooter() {
  const { t } = useStore();
  return (
    <footer className="mt-20 bg-primary text-primary-foreground print:hidden">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow text-brand-bright">{t.ui.impactTitle}</p>
            <p className="mt-2 font-display text-2xl font-bold">{t.ui.track}</p>
            <p className="mt-3 text-sm text-primary-foreground/75">{t.ui.impactSub}</p>
          </div>
          <ImpactGrid />
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>BorderlessWork Hub · {t.ui.appTag}</p>
          <p className="max-w-xl sm:text-right">{t.ui.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
