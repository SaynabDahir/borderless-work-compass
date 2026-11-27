import type { Dict } from "@/i18n/en";
import type { Invoice } from "./invoice";
import type { Arrangement, Country, DocStatus, PayKey } from "./rules";

export type ScenarioId = keyof Dict["legal"]["scenarios"];
export type SampleId = keyof Dict["samples"];
export type Role = "professional" | "employer";

export type Case = {
  id: string;
  name: string;
  custom: boolean;
  role: Role;
  country: Country;
  arrangement: Arrangement;
  doc: DocStatus;
  /** ids of ticked compliance steps */
  done: string[];
  pay: Record<PayKey, boolean>;
  invoice: Invoice;
  tracker: Invoice[];
  scenario: ScenarioId;
  /** "scenarioId:stepIndex" of ticked scenario steps */
  scenarioDone: string[];
};

export function blankInvoice(id: string, number: string, date: string): Invoice {
  return {
    id,
    number,
    issue: date,
    due: date,
    currency: "USD",
    fromName: "",
    fromAddress: "",
    fromTaxId: "",
    toName: "",
    toAddress: "",
    items: [{ id: `${id}-1`, desc: "", qty: 1, rate: 0 }],
    taxRate: 0,
    notes: "",
    payTo: "",
    status: "draft",
  };
}

const aminaPaid: Invoice = {
  id: "s1-inv10",
  number: "INV-2026-010",
  issue: "2026-10-20",
  due: "2026-11-03",
  currency: "USD",
  fromName: "Amina Yusuf",
  fromAddress: "Eastleigh, Nairobi, Kenya",
  fromTaxId: "",
  toName: "Tulip Digital B.V.",
  toAddress: "Herengracht 120, 1015 BT Amsterdam, Netherlands",
  items: [{ id: "a", desc: "Frontend development — sprint 13", qty: 38, rate: 28 }],
  taxRate: 0,
  notes: "",
  payTo: "M-Pesa via transfer service · +254 7XX XXX 214",
  status: "paid",
};

export const SAMPLES: Case[] = [
  {
    id: "s1",
    name: "Amina Yusuf — Software developer, Nairobi",
    custom: false,
    role: "professional",
    country: "KE",
    arrangement: "contractor",
    doc: "refugee",
    done: ["d_copies", "ke_drs", "a_contract"],
    pay: { id: true, tax: false, bank: false, mobile: true, intl: false, contract: true },
    invoice: {
      ...aminaPaid,
      id: "s1-inv11",
      number: "INV-2026-011",
      issue: "2026-11-20",
      due: "2026-12-04",
      items: [
        { id: "a", desc: "Frontend development — sprint 14", qty: 40, rate: 28 },
        { id: "b", desc: "Code review and QA", qty: 6, rate: 28 },
      ],
      status: "sent",
    },
    tracker: [aminaPaid],
    scenario: "kyc",
    scenarioDone: [],
  },
  {
    id: "s2",
    name: "Jean-Claude Mugisha — Accountant, Kampala",
    custom: false,
    role: "professional",
    country: "UG",
    arrangement: "employment",
    doc: "full",
    done: ["d_copies", "ug_opm", "ug_tin", "a_offer"],
    pay: { id: true, tax: true, bank: true, mobile: true, intl: false, contract: true },
    invoice: {
      id: "s2-inv1",
      number: "JCM-2026-004",
      issue: "2026-11-25",
      due: "2026-12-10",
      currency: "UGX",
      fromName: "Jean-Claude Mugisha",
      fromAddress: "Kansanga, Kampala, Uganda",
      fromTaxId: "TIN 1017XXXXXX",
      toName: "Kampala Fresh Foods Ltd",
      toAddress: "Plot 14, Sixth Street, Industrial Area, Kampala",
      items: [{ id: "a", desc: "Bookkeeping and VAT return — November 2026", qty: 1, rate: 1800000 }],
      taxRate: 0,
      notes: "",
      payTo: "Bank transfer · Stanbic Bank Uganda · Acct ending 4471",
      status: "draft",
    },
    tracker: [],
    scenario: "expiry",
    scenarioDone: [],
  },
  {
    id: "s3",
    name: "Hadiya Rahimi — UX designer, Berlin",
    custom: false,
    role: "professional",
    country: "DE",
    arrangement: "fellowship",
    doc: "asylum",
    done: [],
    pay: { id: true, tax: true, bank: true, mobile: false, intl: false, contract: false },
    invoice: {
      id: "s3-inv1",
      number: "HR-2026-001",
      issue: "2026-11-27",
      due: "2026-12-11",
      currency: "EUR",
      fromName: "Hadiya Rahimi",
      fromAddress: "Neukölln, 12043 Berlin, Germany",
      fromTaxId: "Steuer-ID 48 XXX XXX XXX",
      toName: "Offene Werkstatt gGmbH",
      toAddress: "Oranienstraße 25, 10999 Berlin, Germany",
      items: [{ id: "a", desc: "Design fellowship stipend — November 2026", qty: 1, rate: 1200 }],
      taxRate: 0,
      notes: "",
      payTo: "SEPA · IBAN DE•• •••• •••• •••• 3391",
      status: "draft",
    },
    tracker: [],
    scenario: "refused",
    scenarioDone: [],
  },
  {
    id: "s4",
    name: "Lumen Analytics — hiring Samir Osman, data analyst",
    custom: false,
    role: "employer",
    country: "GL",
    arrangement: "contractor",
    doc: "full",
    done: ["d_copies", "gl_residence"],
    pay: { id: true, tax: true, bank: true, mobile: false, intl: true, contract: false },
    invoice: {
      id: "s4-inv1",
      number: "SO-2026-007",
      issue: "2026-10-27",
      due: "2026-11-10",
      currency: "USD",
      fromName: "Samir Osman",
      fromAddress: "Kigali, Rwanda",
      fromTaxId: "TIN 12XXXXXXX",
      toName: "Lumen Analytics Inc.",
      toAddress: "548 Market Street, San Francisco, CA 94104, USA",
      items: [
        { id: "a", desc: "Data pipeline audit", qty: 25, rate: 45 },
        { id: "b", desc: "Reporting dashboard build (fixed fee)", qty: 1, rate: 900 },
      ],
      taxRate: 0,
      notes: "",
      payTo: "Transfer service · USD account ending 8820",
      status: "overdue",
    },
    tracker: [],
    scenario: "late",
    scenarioDone: [],
  },
];
