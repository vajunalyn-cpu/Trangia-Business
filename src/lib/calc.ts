import { rules } from "@/content/incentives";

export type Orientation = "export" | "domestic";

export type CalcInput = {
  orientation: Orientation;
  grossSales: number; // annual, PHP
  costOfSales: number; // direct costs, PHP
  operatingExpenses: number; // other deductible expenses, PHP
  growthPct: number; // annual growth applied to all three lines
  ithYears: number;
  postYears: number;
  smallCorp: boolean; // regular rate 20% instead of 25% in the baseline
  includeRbelt: boolean; // LGU imposes the 2% RBE local tax during ITH/EDR
};

export type YearRow = {
  year: number;
  phase: "ITH" | "Post-ITH";
  gie: number;
  taxable: number;
  regular: number;
  scit: number | null; // null when SCIT is not available (domestic market)
  edr: number;
};

export type CalcResult = {
  rows: YearRow[];
  totals: { regular: number; scit: number | null; edr: number };
  savings: { scit: number | null; edr: number };
  best: "scit" | "edr";
  warnings: string[];
};

export type FieldErrors = Partial<Record<keyof CalcInput, string>>;

export function validate(i: CalcInput): FieldErrors {
  const e: FieldErrors = {};
  const money = (k: "grossSales" | "costOfSales" | "operatingExpenses", label: string) => {
    const v = i[k];
    if (!Number.isFinite(v)) e[k] = `Enter ${label} as a number.`;
    else if (v < 0) e[k] = `${label[0].toUpperCase() + label.slice(1)} can't be negative.`;
  };
  money("grossSales", "gross sales");
  money("costOfSales", "cost of sales");
  money("operatingExpenses", "operating expenses");
  if (!e.grossSales && i.grossSales === 0) e.grossSales = "Enter projected annual gross sales above zero.";
  if (!e.costOfSales && !e.grossSales && i.costOfSales > i.grossSales)
    e.costOfSales = "Cost of sales is higher than gross sales, so there is no gross income to estimate on.";
  if (!Number.isFinite(i.growthPct) || i.growthPct < -50 || i.growthPct > 100)
    e.growthPct = "Use an annual growth rate between −50% and 100%.";
  if (i.ithYears < rules.ith.min || i.ithYears > rules.ith.max)
    e.ithYears = `ITH runs ${rules.ith.min} to ${rules.ith.max} years.`;
  if (i.postYears < rules.post.min || i.postYears > rules.post.max)
    e.postYears = `Use ${rules.post.min} to ${rules.post.max} years.`;
  return e;
}

export function calculate(i: CalcInput): CalcResult {
  const rows: YearRow[] = [];
  const years = i.ithYears + i.postYears;
  const baseRate = i.smallCorp ? rules.smallCorpCit : rules.regularCit;
  const rbelt = i.includeRbelt ? rules.rbeltMax : 0;
  const warnings: string[] = [];

  for (let y = 1; y <= years; y++) {
    const g = Math.pow(1 + i.growthPct / 100, y - 1);
    const sales = i.grossSales * g;
    const gie = Math.max(0, sales - i.costOfSales * g);
    const taxable = gie - i.operatingExpenses * g;
    const positive = Math.max(0, taxable);
    const inIth = y <= i.ithYears;

    const regular = positive * baseRate;
    const localDuringIncentive = gie * rbelt;
    const edr = inIth ? localDuringIncentive : positive * rules.edrCit + localDuringIncentive;
    const scit = i.orientation === "domestic" ? null : inIth ? localDuringIncentive : gie * rules.scit;

    rows.push({ year: y, phase: inIth ? "ITH" : "Post-ITH", gie, taxable, regular, scit, edr });
  }

  const sum = (k: "regular" | "edr") => rows.reduce((s, r) => s + r[k], 0);
  const totals = {
    regular: sum("regular"),
    edr: sum("edr"),
    scit: i.orientation === "domestic" ? null : rows.reduce((s, r) => s + (r.scit ?? 0), 0),
  };
  const savings = {
    edr: totals.regular - totals.edr,
    scit: totals.scit === null ? null : totals.regular - totals.scit,
  };
  const best = savings.scit !== null && savings.scit > savings.edr ? "scit" : "edr";

  if (rows.some((r) => r.taxable < 0))
    warnings.push(
      "Some years show a loss. Losses are not carried forward in this estimate, although the law allows it in specific cases."
    );
  if (savings.scit !== null && savings.scit < 0)
    warnings.push(
      "SCIT costs more than the regular rate here because 5% of gross income exceeds the income tax on your margin. Lower-margin projects often fare better under the EDR."
    );

  return { rows, totals, savings, best, warnings };
}

export function toCsv(i: CalcInput, r: CalcResult): string {
  const head = ["Year", "Phase", "Gross income earned (PHP)", "Taxable income (PHP)", "Regular regime (PHP)", "ITH then SCIT (PHP)", "ITH then EDR (PHP)"];
  const lines = r.rows.map((x) =>
    [x.year, x.phase, x.gie, x.taxable, x.regular, x.scit ?? "n/a", x.edr].map((v) => (typeof v === "number" ? v.toFixed(2) : v)).join(",")
  );
  const meta = [
    `# Trangia Business — illustrative PEZA incentive estimate`,
    `# Orientation: ${i.orientation}; ITH years: ${i.ithYears}; post-ITH years: ${i.postYears}; small-corp rate: ${i.smallCorp}; RBE local tax 2%: ${i.includeRbelt}`,
    `# Not an official PEZA determination or tax advice.`,
  ];
  return [...meta, head.join(","), ...lines].join("\n");
}
