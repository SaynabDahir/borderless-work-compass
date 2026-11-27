import type { Dict } from "@/i18n/en";

export type Country = "KE" | "UG" | "DE" | "CA" | "GL";
export type Arrangement = "contractor" | "employment" | "fellowship";
export type DocStatus = "full" | "refugee" | "asylum" | "none";
export type StepId = keyof Dict["steps"];
export type AlertId = keyof Dict["alerts"];
export type EmployerId = keyof Dict["employer"];
export type PayKey = keyof Dict["pay"]["items"];
export type RailId = keyof Dict["pay"]["railName"];
export type Band = "bandLow" | "bandMid" | "bandHigh" | "bandReady";

export const COUNTRIES: Country[] = ["KE", "UG", "DE", "CA", "GL"];
export const ARRANGEMENTS: Arrangement[] = ["contractor", "employment", "fellowship"];
export const DOC_STATUSES: DocStatus[] = ["full", "refugee", "asylum", "none"];

const DOC_STEPS: Record<DocStatus, StepId[]> = {
  full: ["d_copies", "d_expiry"],
  refugee: ["d_copies"],
  asylum: ["d_followup"],
  none: ["d_register"],
};

// permit: true marks steps that only apply while work authorisation is still missing.
const COUNTRY_STEPS: Record<Country, { id: StepId; permit?: true }[]> = {
  KE: [{ id: "ke_drs" }, { id: "ke_classm", permit: true }, { id: "ke_kra" }],
  UG: [{ id: "ug_opm" }, { id: "ug_right", permit: true }, { id: "ug_tin" }],
  DE: [{ id: "de_title" }, { id: "de_abh", permit: true }, { id: "de_tax" }],
  CA: [{ id: "ca_permit", permit: true }, { id: "ca_sin" }, { id: "ca_cra" }],
  GL: [{ id: "gl_residence" }, { id: "gl_tax" }, { id: "gl_eor" }],
};

const ARR_STEPS: Record<Arrangement, StepId[]> = {
  contractor: ["a_contract", "a_invoice", "a_selftax"],
  employment: ["a_offer", "a_payroll"],
  fellowship: ["a_letter", "a_stipend"],
};

export function getSteps(c: Country, a: Arrangement, d: DocStatus): StepId[] {
  const country = COUNTRY_STEPS[c].filter((s) => !(s.permit && d === "full")).map((s) => s.id);
  return [...DOC_STEPS[d], ...country, ...ARR_STEPS[a]];
}

export function getAlerts(c: Country, a: Arrangement, d: DocStatus): AlertId[] {
  const out: AlertId[] = [];
  if (d === "none") out.push("al_none");
  if (c === "DE" && d === "asylum" && a === "contractor") out.push("al_de_self");
  if (c === "KE" && d !== "full") out.push("al_ke");
  if (c === "GL") out.push("al_gl");
  return out;
}

const ARR_EMPLOYER: Record<Arrangement, EmployerId> = {
  contractor: "e_contractor",
  employment: "e_payroll",
  fellowship: "e_fellow",
};
const COUNTRY_EMPLOYER: Record<Country, EmployerId> = {
  KE: "e_ke",
  UG: "e_ug",
  DE: "e_de",
  CA: "e_ca",
  GL: "e_eor",
};

export function getEmployerGuidance(c: Country, a: Arrangement): EmployerId[] {
  return ["e_verify", "e_nondiscrim", ARR_EMPLOYER[a], COUNTRY_EMPLOYER[c], "e_pay"];
}

const DOC_BASE: Record<DocStatus, number> = { full: 70, refugee: 50, asylum: 30, none: 10 };
const COUNTRY_ADJ: Record<Country, number> = { KE: 0, UG: 10, DE: 5, CA: 5, GL: -5 };

/** Starting score before any checklist step is ticked. */
export function baseScore(c: Country, a: Arrangement, d: DocStatus): number {
  let s = DOC_BASE[d] + COUNTRY_ADJ[c] + (a === "fellowship" ? 5 : 0);
  if (c === "DE" && d === "asylum" && a === "contractor") s -= 15;
  return Math.min(85, Math.max(5, s));
}

/** Base score plus the remaining points earned in proportion to completed steps; 100 only when all are done. */
export function complianceScore(c: Country, a: Arrangement, d: DocStatus, done: string[]): number {
  const steps = getSteps(c, a, d);
  const base = baseScore(c, a, d);
  const completed = steps.filter((s) => done.includes(s)).length;
  return Math.round(base + (100 - base) * (completed / steps.length));
}

export function band(score: number): Band {
  if (score >= 90) return "bandReady";
  if (score >= 70) return "bandHigh";
  if (score >= 40) return "bandMid";
  return "bandLow";
}

/* ---------- Payments ---------- */

const PAY_WEIGHT: Record<PayKey, number> = { id: 25, tax: 20, bank: 15, mobile: 10, intl: 15, contract: 15 };
const MOBILE_COUNTRIES: Country[] = ["KE", "UG", "GL"];

export function payKeys(c: Country): PayKey[] {
  const all: PayKey[] = ["id", "tax", "bank", "mobile", "intl", "contract"];
  return all.filter((k) => k !== "mobile" || MOBILE_COUNTRIES.includes(c));
}

export function payScore(c: Country, pay: Record<PayKey, boolean>): number {
  const keys = payKeys(c);
  const total = keys.reduce((n, k) => n + PAY_WEIGHT[k], 0);
  const have = keys.reduce((n, k) => n + (pay[k] ? PAY_WEIGHT[k] : 0), 0);
  return Math.round((have / total) * 100);
}

const COUNTRY_RAILS: Record<Country, RailId[]> = {
  KE: ["mpesa", "local", "transfer", "swift"],
  UG: ["momo", "local", "transfer", "swift"],
  DE: ["sepa", "transfer", "swift"],
  CA: ["interac", "transfer", "swift"],
  GL: ["transfer", "swift", "local"],
};
const RAIL_NEEDS: Record<RailId, PayKey[]> = {
  mpesa: ["mobile", "id"],
  momo: ["mobile", "id"],
  local: ["bank"],
  sepa: ["bank"],
  interac: ["bank", "tax"],
  swift: ["bank"],
  transfer: ["intl", "id"],
};

export function getRails(c: Country, pay: Record<PayKey, boolean>): { id: RailId; ready: boolean }[] {
  return COUNTRY_RAILS[c].map((id) => ({ id, ready: RAIL_NEEDS[id].every((k) => pay[k]) }));
}

export const TAX_ID_NAME: Record<Country, string | null> = {
  KE: "KRA PIN",
  UG: "URA TIN",
  DE: "Steuer-ID",
  CA: "SIN",
  GL: null,
};
