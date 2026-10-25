import type { YearRow } from "@/lib/calc";
import s from "./PezaCalculator.module.css";

const W = 560, H = 260, PAD = { l: 56, r: 16, t: 16, b: 34 };

const compact = (n: number) =>
  "₱" + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

/** Cumulative estimated tax per scenario across the incentive period. */
export function CumulativeChart({ rows, ithYears, domestic }: { rows: YearRow[]; ithYears: number; domestic: boolean }) {
  const acc = (k: "regular" | "edr" | "scit") => {
    let t = 0;
    return rows.map((r) => (t += (k === "scit" ? r.scit : r[k]) ?? 0));
  };
  const series = [
    { key: "regular", label: "Regular regime", values: acc("regular") },
    ...(domestic ? [] : [{ key: "scit", label: "ITH, then SCIT", values: acc("scit") }]),
    { key: "edr", label: "ITH, then EDR", values: acc("edr") },
  ];
  const max = Math.max(1, ...series.flatMap((x) => x.values));
  const n = rows.length;
  const x = (i: number) => PAD.l + (i / Math.max(1, n - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b);
  const ticks = [0, 0.5, 1].map((f) => f * max);
  const ithX = x(ithYears - 1) + (x(1) - x(0)) / 2;

  return (
    <figure className={s.chart}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="chart-desc">
        <desc id="chart-desc">
          Cumulative estimated income taxes by year.{" "}
          {series.map((sr) => `${sr.label}: ${compact(sr.values[n - 1])} by year ${n}.`).join(" ")}
        </desc>
        <rect x={PAD.l} y={PAD.t} width={Math.max(0, ithX - PAD.l)} height={H - PAD.t - PAD.b} className={s.ithBand} />
        <text x={PAD.l + 6} y={PAD.t + 14} className={s.ithText}>
          Holiday
        </text>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className={s.grid} />
            <text x={PAD.l - 8} y={y(t)} className={s.yLabel}>
              {compact(t)}
            </text>
          </g>
        ))}
        {[1, ithYears, n].filter((v, i, a) => a.indexOf(v) === i).map((yr) => (
          <text key={yr} x={x(yr - 1)} y={H - 12} className={s.xLabel} textAnchor={yr === n ? "end" : yr === 1 ? "start" : "middle"}>
            Year {yr}
          </text>
        ))}
        {series.map((sr) => (
          <polyline key={sr.key} points={sr.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} className={s.line} data-key={sr.key} />
        ))}
      </svg>
      <figcaption className={s.legend2}>
        {series.map((sr) => (
          <span key={sr.key} data-key={sr.key}>
            {sr.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
