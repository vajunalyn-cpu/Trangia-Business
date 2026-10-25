import Link from "next/link";
import { calculate } from "@/lib/calc";
import { Tilt } from "./fx/Tilt";
import s from "./CalculatorTeaser.module.css";

// A worked example computed by the same engine as the calculator, with its inputs stated.
const example = {
  orientation: "export" as const,
  grossSales: 100_000_000,
  costOfSales: 60_000_000,
  operatingExpenses: 15_000_000,
  growthPct: 0,
  ithYears: 4,
  postYears: 10,
  smallCorp: false,
  includeRbelt: false,
};

const php = (n: number) => `₱${(n / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}M`;

export function CalculatorTeaser() {
  const r = calculate(example);
  const max = r.totals.regular;
  const bars = [
    { label: "Regular 25% income tax", value: r.totals.regular },
    { label: "4-year ITH, then 5% SCIT", value: r.totals.scit ?? 0 },
    { label: "4-year ITH, then EDR at 20%", value: r.totals.edr },
  ];
  return (
    <section className="section surface-ivory on-light" aria-labelledby="calc-teaser-title">
      <div className={`wrap ${s.layout}`}>
        <div>
          <hr className="rule-gold" />
          <h2 id="calc-teaser-title" className="h2">
            Estimate what PEZA incentives could mean for your project
          </h2>
          <p className="lede">
            Enter projected sales and costs to compare the regular regime with an income tax holiday followed by SCIT or the
            enhanced deductions. Every assumption is shown, and the result is yours to print.
          </p>
          <Link href="/peza/#calculator" className={`btn btn-navy ${s.cta}`}>
            Open the calculator
          </Link>
        </div>
        <Tilt as="figure" className={s.example}>
          <figcaption className={s.caption}>
            Worked example over 14 years: an export enterprise with ₱100M annual sales, ₱60M cost of sales and ₱15M operating
            expenses.
          </figcaption>
          <ul className={s.bars}>
            {bars.map((b) => (
              <li key={b.label}>
                <span className={s.barLabel}>{b.label}</span>
                <span className={s.track}>
                  <span className={s.fill} style={{ width: `${(b.value / max) * 100}%` }} />
                </span>
                <span className={s.value}>{php(b.value)}</span>
              </li>
            ))}
          </ul>
          <p className="cite">Estimated income-related taxes only. Illustrative, not an official determination.</p>
        </Tilt>
      </div>
    </section>
  );
}
