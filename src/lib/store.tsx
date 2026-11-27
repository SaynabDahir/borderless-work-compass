import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { DICTS, isLang, type Dict, type Lang } from "@/i18n";
import { uid } from "./download";
import { SAMPLES, blankInvoice, type Case, type Role } from "./samples";

const KEY = "bwh:v1";

type State = { lang: Lang; active: Case; saved: Case[] };

type Store = State & {
  t: Dict;
  setLang: (l: Lang) => void;
  /** Changes the active case; custom cases are saved automatically. */
  update: (patch: Partial<Case>) => void;
  load: (c: Case) => void;
  createCase: (name: string, role: Role) => void;
  saveCopy: () => void;
  deleteCase: (id: string) => void;
};

const Ctx = createContext<Store | null>(null);
const FIRST = SAMPLES[0]!;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ lang: "en", active: FIRST, saved: [] });
  const ready = useRef(false);

  // Device storage is read after hydration so the server and first client render match.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<State>;
        setState((s) => ({
          lang: isLang(p.lang) ? p.lang : s.lang,
          active: p.active?.id ? p.active : s.active,
          saved: Array.isArray(p.saved) ? p.saved : s.saved,
        }));
      }
    } catch {
      // unreadable storage: keep defaults
    }
    ready.current = true;
    document.documentElement.setAttribute("data-app-ready", "true");
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    document.documentElement.lang = state.lang;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked
    }
  }, [state]);

  const setLang = useCallback((lang: Lang) => setState((s) => ({ ...s, lang })), []);

  const update = useCallback((patch: Partial<Case>) => {
    setState((s) => {
      const active = { ...s.active, ...patch };
      return {
        ...s,
        active,
        saved: active.custom ? s.saved.map((c) => (c.id === active.id ? active : c)) : s.saved,
      };
    });
  }, []);

  const load = useCallback((c: Case) => setState((s) => ({ ...s, active: structuredClone(c) })), []);

  const createCase = useCallback((name: string, role: Role) => {
    const id = uid();
    const today = new Date().toISOString().slice(0, 10);
    const c: Case = {
      id,
      name,
      custom: true,
      role,
      country: "KE",
      arrangement: "contractor",
      doc: "refugee",
      done: [],
      pay: { id: false, tax: false, bank: false, mobile: false, intl: false, contract: false },
      invoice: blankInvoice(uid(), "INV-001", today),
      tracker: [],
      scenario: "late",
      scenarioDone: [],
    };
    setState((s) => ({ ...s, active: c, saved: [...s.saved, c] }));
  }, []);

  const saveCopy = useCallback(() => {
    setState((s) => {
      if (s.active.custom) return s;
      const c: Case = { ...structuredClone(s.active), id: uid(), custom: true };
      return { ...s, active: c, saved: [...s.saved, c] };
    });
  }, []);

  const deleteCase = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      saved: s.saved.filter((c) => c.id !== id),
      active: s.active.id === id ? FIRST : s.active,
    }));
  }, []);

  const value = useMemo<Store>(
    () => ({ ...state, t: DICTS[state.lang], setLang, update, load, createCase, saveCopy, deleteCase }),
    [state, setLang, update, load, createCase, saveCopy, deleteCase],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
