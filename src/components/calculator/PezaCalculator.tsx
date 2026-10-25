"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { calculate, toCsv, validate, type CalcInput, type FieldErrors } from "@/lib/calc";
import { rules, ruleNotes, disclaimer } from "@/content/incentives";
import { Cite } from "../Cite";
import { MoneyField } from "./MoneyField";
import { CumulativeChart } from "./CumulativeChart";
import s from "./PezaCalculator.module.css";

const DEFAULTS: CalcInput = {
  orientation: "export",
  grossSales: 100_000_000,
  costOfSales: 60_000_000,
  operatingExpenses: 15_000_000,
  growthPct: 0,
  ithYears: 4,
  postYears: rules.post.default,
  smallCorp: false,
  includeRbelt: false,
};

const pct = (n: number) => `${Math.round(n * 100)}%`;

export function PezaCalculator() {
  const uid = useId();
  const [input, setInput] = useState<CalcInput>(DEFAULTS);
  const [fx, setFx] = useState("");
  const fxRate = Number(fx.replace(/,/g, ""));
  const showUsd = Number.isFinite(fxRate) && fxRate > 0;

  const errors: FieldErrors = useMemo(() => validate(input), [input]);
  const hasErrors = Object.keys(errors).length > 0;
  const result = useMemo(() => (hasErrors ? null : calculate(input)), [input, hasErrors]);

  const set = <K extends keyof CalcInput>(k: K, v: CalcInput[K]) => setInput((p) => ({ ...p, [k]: v }));

  const fmt = useMemo(() => {
    const php = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
    const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    return (n: number) => (showUsd ? `${php.format(n)} (${usd.format(n / fxRate)})` : php.format(n));
  }, [showUsd, fxRate]);

  const domestic = input.orientation === "domestic";
  const years = input.ithYears + input.postYears;

  const download = () => {
    if (!result) return;
    const blob = new Blob([toCsv(input, result)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "trangia-peza-incentive-estimate.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const printReport = () => {
    document.querySelectorAll<HTMLDetailsElement>("#calculator-report details").forEach((d) => (d.open = true));
    window.print();
  };

  const scenarios = result
    ? [
        { key: "regular", label: `Regular regime (${pct(input.smallCorp ? rules.smallCorpCit : rules.regularCit)} income tax)`, total: result.totals.regular, saving: 0 },
        ...(result.totals.scit !== null
          ? [{ key: "scit", label: `${input.ithYears}-year ITH, then ${pct(rules.scit)} SCIT`, total: result.totals.scit, saving: result.savings.scit! }]
          : []),
        { key: "edr", label: `${input.ithYears}-year ITH, then EDR at ${pct(rules.edrCit)}`, total: result.totals.edr, saving: result.savings.edr },
      ]
    : [];

  return (
    <section id="calculator" className={`section surface-ivory on-light ${s.section}`} aria-labelledby={`${uid}-title`}>
      <div className="wrap">
        <header className={s.head}>
          <hr className="rule-gold" />
          <h2 id={`${uid}-title`} className="h2">
            PEZA incentive calculator
          </h2>
          <p className="lede">
            Compare estimated income taxes under the regular regime with an income tax holiday followed by the special corporate
            income tax or the enhanced deductions. Results update as you type.
          </p>
        </header>

        <div className={s.layout}>
          <form className={`${s.form} no-print`} onSubmit={(e) => e.preventDefault()} noValidate aria-describedby={`${uid}-formnote`}>
            <p id={`${uid}-formnote`} className="visually-hidden">
              The estimate updates automatically when you change a field.
            </p>

            <fieldset className={s.fieldset}>
              <legend className={s.legend}>Where will you sell?</legend>
              <div className={s.choice}>
                {(
                  [
                    ["export", "Export enterprise", "Sells mainly to customers outside the Philippines"],
                    ["domestic", "Domestic market enterprise", "Sells mainly within the Philippines"],
                  ] as const
                ).map(([value, label, hint]) => (
                  <label key={value} className={s.choiceItem}>
                    <input type="radio" name={`${uid}-orientation`} value={value} checked={input.orientation === value} onChange={() => set("orientation", value)} />
                    <span>
                      <span className={s.choiceLabel}>{label}</span>
                      <span className={s.hint}>{hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              {domestic && <p className={s.inlineNote}>Domestic market enterprises can&rsquo;t elect SCIT, so only the EDR path is shown.</p>}
            </fieldset>

            <fieldset className={s.fieldset}>
              <legend className={s.legend}>Projected annual figures (PHP)</legend>
              <MoneyField
                id={`${uid}-sales`}
                label="Gross sales or revenue"
                hint="Net of discounts and returns"
                value={input.grossSales}
                onChange={(v) => set("grossSales", v)}
                error={errors.grossSales}
              />
              <MoneyField
                id={`${uid}-cos`}
                label="Cost of sales or direct costs"
                hint="Direct materials, labour and overheads of the registered activity. Gross income earned is sales minus this."
                value={input.costOfSales}
                onChange={(v) => set("costOfSales", v)}
                error={errors.costOfSales}
              />
              <MoneyField
                id={`${uid}-opex`}
                label="Other operating expenses"
                hint="Deductible expenses not in cost of sales, such as administration and selling costs"
                value={input.operatingExpenses}
                onChange={(v) => set("operatingExpenses", v)}
                error={errors.operatingExpenses}
              />
              <div className={s.field}>
                <label htmlFor={`${uid}-growth`} className={s.label}>
                  Annual growth
                </label>
                <div className={s.suffixWrap}>
                  <input
                    id={`${uid}-growth`}
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    className={s.input}
                    value={Number.isFinite(input.growthPct) ? input.growthPct : ""}
                    onChange={(e) => set("growthPct", e.target.value === "" ? 0 : Number(e.target.value))}
                    aria-invalid={!!errors.growthPct}
                    aria-describedby={`${uid}-growth-hint${errors.growthPct ? ` ${uid}-growth-err` : ""}`}
                  />
                  <span className={s.suffix}>%</span>
                </div>
                <p id={`${uid}-growth-hint`} className={s.hint}>
                  Applied to sales and costs each year
                </p>
                {errors.growthPct && (
                  <p id={`${uid}-growth-err`} className={s.error}>
                    {errors.growthPct}
                  </p>
                )}
              </div>
            </fieldset>

            <fieldset className={s.fieldset}>
              <legend className={s.legend}>Incentive period</legend>
              <div className={s.field}>
                <span className={s.label} id={`${uid}-ith-label`}>
                  Income tax holiday
                </span>
                <div className={s.segments} role="radiogroup" aria-labelledby={`${uid}-ith-label`}>
                  {[4, 5, 6, 7].map((y) => (
                    <label key={y} className={s.segment}>
                      <input type="radio" name={`${uid}-ith`} checked={input.ithYears === y} onChange={() => set("ithYears", y)} />
                      <span>{y} years</span>
                    </label>
                  ))}
                </div>
                <p className={s.hint}>
                  Set by your project&rsquo;s priority tier and location. If you don&rsquo;t know yet, start with 4 years, the most
                  conservative case.
                </p>
              </div>
              <div className={s.field}>
                <label htmlFor={`${uid}-post`} className={s.label}>
                  {domestic ? "EDR period after the holiday" : "SCIT or EDR period after the holiday"}
                </label>
                <div className={s.suffixWrap}>
                  <input
                    id={`${uid}-post`}
                    type="number"
                    inputMode="numeric"
                    min={rules.post.min}
                    max={rules.post.max}
                    className={s.input}
                    value={input.postYears}
                    onChange={(e) => set("postYears", Math.round(Number(e.target.value)))}
                    aria-invalid={!!errors.postYears}
                    aria-describedby={`${uid}-post-hint${errors.postYears ? ` ${uid}-post-err` : ""}`}
                  />
                  <span className={s.suffix}>years</span>
                </div>
                <p id={`${uid}-post-hint`} className={s.hint}>
                  Stated in your registration. Summaries of the law report 10 years for some projects and up to 20 for FIRB-approved
                  export projects.
                </p>
                {errors.postYears && (
                  <p id={`${uid}-post-err`} className={s.error}>
                    {errors.postYears}
                  </p>
                )}
              </div>
            </fieldset>

            <fieldset className={s.fieldset}>
              <legend className={s.legend}>Options</legend>
              <label className={s.check}>
                <input type="checkbox" checked={input.smallCorp} onChange={(e) => set("smallCorp", e.target.checked)} />
                <span>
                  Use the 20% regular rate for comparison
                  <span className={s.hint}>For corporations with net taxable income up to ₱5M and total assets up to ₱100M, excluding land</span>
                </span>
              </label>
              <label className={s.check}>
                <input type="checkbox" checked={input.includeRbelt} onChange={(e) => set("includeRbelt", e.target.checked)} />
                <span>
                  Include a 2% local tax during the holiday and EDR
                  <span className={s.hint}>The maximum RBE local tax a city or municipality may impose; it doesn&rsquo;t apply under SCIT</span>
                </span>
              </label>
              <div className={s.field}>
                <label htmlFor={`${uid}-fx`} className={s.label}>
                  Show US dollars too (optional)
                </label>
                <div className={s.suffixWrap}>
                  <input
                    id={`${uid}-fx`}
                    type="text"
                    inputMode="decimal"
                    className={s.input}
                    placeholder="PHP per USD"
                    value={fx}
                    onChange={(e) => setFx(e.target.value)}
                    aria-describedby={`${uid}-fx-hint`}
                  />
                  <span className={s.suffix}>₱ / $1</span>
                </div>
                <p id={`${uid}-fx-hint`} className={s.hint}>
                  Enter today&rsquo;s exchange rate; we don&rsquo;t assume one.
                </p>
              </div>
            </fieldset>

            <button type="button" className="btn btn-ghost-dark" onClick={() => { setInput(DEFAULTS); setFx(""); }}>
              Reset to example values
            </button>
          </form>

          <div id="calculator-report" className={s.report} aria-live="polite">
            <p className={s.printOnly}>Trangia Business: illustrative PEZA incentive estimate</p>
            {!result ? (
              <div className={s.blocked}>
                <h3 className="h3">Check the highlighted fields</h3>
                <p className="muted">The estimate appears once every figure is valid.</p>
              </div>
            ) : (
              <>
                <h3 className={s.reportTitle}>Estimated income taxes over {years} years</h3>
                <ul className={s.scenarios}>
                  {scenarios.map((sc) => {
                    const lowest = sc.key === result.best && sc.saving > 0;
                    return (
                      <li key={sc.key} className={s.scenario} data-key={sc.key} data-lowest={lowest}>
                        <span className={s.scLabel}>{sc.label}</span>
                        <span className={s.scTotal}>{fmt(sc.total)}</span>
                        {sc.key !== "regular" && (
                          <span className={s.scSaving} data-negative={sc.saving < 0}>
                            {sc.saving >= 0 ? `${fmt(sc.saving)} less than regular` : `${fmt(-sc.saving)} more than regular`}
                          </span>
                        )}
                        {lowest && <span className={s.badge}>Lowest in this scenario</span>}
                      </li>
                    );
                  })}
                </ul>

                <CumulativeChart rows={result.rows} ithYears={input.ithYears} domestic={domestic} />

                {result.warnings.length > 0 && (
                  <ul className={s.warnings}>
                    {result.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                )}

                <details className={s.table}>
                  <summary>Year-by-year figures</summary>
                  <div className={s.tableScroll}>
                    <table>
                      <thead>
                        <tr>
                          <th scope="col">Year</th>
                          <th scope="col">Gross income earned</th>
                          <th scope="col">Regular</th>
                          {!domestic && <th scope="col">ITH, then SCIT</th>}
                          <th scope="col">ITH, then EDR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((r) => (
                          <tr key={r.year} data-ith={r.phase === "ITH"}>
                            <th scope="row">
                              {r.year}
                              {r.phase === "ITH" && <span className={s.ithTag}> ITH</span>}
                            </th>
                            <td>{fmt(r.gie)}</td>
                            <td>{fmt(r.regular)}</td>
                            {!domestic && <td>{fmt(r.scit ?? 0)}</td>}
                            <td>{fmt(r.edr)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>

                <div className={`${s.actions} no-print`}>
                  <Link href="/inquire/?topic=peza" className="btn btn-navy">
                    Discuss this estimate with a consultant
                  </Link>
                  <button type="button" className="btn btn-ghost-dark" onClick={printReport}>
                    Print summary
                  </button>
                  <button type="button" className="btn btn-ghost-dark" onClick={download}>
                    Download CSV
                  </button>
                </div>
              </>
            )}

            <details className={s.assumptions} open>
              <summary>Assumptions and rules used</summary>
              <ul>
                <li>Covers income-related taxes only. Duties, VAT, and local business taxes outside the RBE local tax are not modelled.</li>
                <li>Enhanced deductions are not modelled; the EDR line applies only the 20% rate, so actual EDR taxes could be lower.</li>
                <li>Losses are not carried forward, and the regular regime is assumed to apply for the full period.</li>
                {ruleNotes.map((n) => (
                  <li key={n.text}>
                    {n.text} <Cite ids={n.sources} />
                  </li>
                ))}
              </ul>
            </details>
            <p className={s.disclaimer}>{disclaimer}</p>
            <p className={s.notOfficial}>This calculator is provided by Trangia Business. It is not an official PEZA tool.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
