import { en, type Dict } from "./en";
import { fr } from "./fr";
import { sw } from "./sw";
import { so } from "./so";

export type Lang = "en" | "fr" | "sw" | "so";
export type { Dict };

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
  { code: "so", label: "Soomaali" },
];

export const DICTS: Record<Lang, Dict> = { en, fr, sw, so };

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "fr" || v === "sw" || v === "so";
}

/** Replaces {name} placeholders in a translated string. */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
