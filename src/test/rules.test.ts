import { describe, expect, it } from "vitest";

import { totals } from "@/lib/invoice";
import { band, complianceScore, getSteps, payScore } from "@/lib/rules";

describe("compliance readiness score", () => {
  it("reaches 100 only when every required step is done", () => {
    const steps = getSteps("KE", "contractor", "refugee");
    expect(complianceScore("KE", "contractor", "refugee", steps)).toBe(100);
    expect(complianceScore("KE", "contractor", "refugee", steps.slice(1))).toBeLessThan(100);
  });

  it("rates someone with no documents as not ready", () => {
    expect(band(complianceScore("KE", "contractor", "none", []))).toBe("bandLow");
  });

  it("rises with each completed step and ignores steps from other setups", () => {
    const none = complianceScore("DE", "fellowship", "asylum", []);
    expect(complianceScore("DE", "fellowship", "asylum", ["de_tax"])).toBeGreaterThan(none);
    expect(complianceScore("DE", "fellowship", "asylum", ["ke_kra"])).toBe(none);
  });

  it("drops permit steps for people who already hold a work permit", () => {
    expect(getSteps("KE", "employment", "full")).not.toContain("ke_classm");
    expect(getSteps("KE", "employment", "refugee")).toContain("ke_classm");
  });
});

describe("payment readiness score", () => {
  const all = { id: true, tax: true, bank: true, mobile: true, intl: true, contract: true };
  it("is 100 with everything in place and 0 with nothing", () => {
    expect(payScore("KE", all)).toBe(100);
    expect(payScore("KE", { id: false, tax: false, bank: false, mobile: false, intl: false, contract: false })).toBe(0);
  });
  it("does not require mobile money where it is not a payout route", () => {
    expect(payScore("DE", { ...all, mobile: false })).toBe(100);
    expect(payScore("KE", { ...all, mobile: false })).toBeLessThan(100);
  });
});

describe("invoice totals", () => {
  it("adds line items and applies tax on the subtotal", () => {
    const t = totals({
      items: [
        { id: "a", desc: "", qty: 40, rate: 28 },
        { id: "b", desc: "", qty: 6, rate: 28 },
      ],
      taxRate: 16,
    });
    expect(t).toEqual({ subtotal: 1288, tax: 206.08, total: 1494.08 });
  });
});
