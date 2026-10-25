import distances from "@/data/distances.generated.json";
import { Cite } from "./Cite";
import s from "./WithinReach.module.css";

const SCALE_MAX = 3000;

// Assign each label to the lowest row where it doesn't collide with the previous label in
// that row. Widths are estimated in % of the scale from the label length.
function stack(items: { name: string; km: number }[]) {
  const rowEnds: number[] = [];
  return items.map((d) => {
    const left = (d.km / SCALE_MAX) * 100;
    const width = Math.max(d.name.length, 8) * 0.72 + 1.2;
    let row = rowEnds.findIndex((end) => end < left);
    if (row === -1) row = rowEnds.length;
    rowEnds[row] = left + width;
    return { ...d, left, row };
  });
}

export function WithinReach() {
  const near = stack(distances.distances.filter((d) => d.km <= SCALE_MAX));
  const rows = Math.max(...near.map((d) => d.row)) + 1;
  const far = distances.distances.filter((d) => d.km > SCALE_MAX);
  return (
    <section id="within-reach" className={`section surface-ivory on-light ${s.section}`} aria-labelledby="reach-title">
      <div className="wrap">
        <div className={s.head}>
          <hr className="rule-gold" />
          <h2 id="reach-title" className="h2">
            Ten of Asia&rsquo;s major business hubs lie within 3,000&nbsp;km of Manila
          </h2>
          <p className="lede">
            The Philippines sits between North and Southeast Asia, on the Pacific edge of the region&rsquo;s shipping and air
            routes.
          </p>
        </div>

        <figure className={s.scale} style={{ ["--rows" as string]: rows }}>
          <figcaption className="visually-hidden">Great-circle distance from Manila, in kilometres</figcaption>
          <div className={s.axis} aria-hidden="true">
            {[0, 1000, 2000, 3000].map((t) => (
              <span key={t} className={s.tick} style={{ left: `${(t / SCALE_MAX) * 100}%` }}>
                {t === 0 ? "Manila" : `${t.toLocaleString("en-US")} km`}
              </span>
            ))}
          </div>
          <ol className={s.hubs}>
            {near.map((d) => (
              <li key={d.name} className={s.hub} style={{ left: `${d.left}%`, ["--row" as string]: d.row }}>
                <span className={s.hubName}>{d.name}</span>
                <span className={s.bar} style={{ ["--w" as string]: d.km / SCALE_MAX }} aria-hidden="true" />
                <span className={s.hubKm}>{d.km.toLocaleString("en-US")} km</span>
              </li>
            ))}
          </ol>
        </figure>

        <div className={s.foot}>
          <p className="small muted">
            Farther afield:{" "}
            {far.map((d, i) => (
              <span key={d.name}>
                {i > 0 && ", "}
                {d.name} {d.km.toLocaleString("en-US")}&nbsp;km
              </span>
            ))}
            .
          </p>
          <p className="cite">Great-circle distances from Manila calculated from city coordinates, rounded to 10 km.</p>
        </div>

        <dl className={s.facts}>
          <div>
            <dt>Population</dt>
            <dd>
              112.7 million
              <Cite ids={["popcen"]} prefix="2024 census" />
            </dd>
          </div>
          <div>
            <dt>Administrative regions</dt>
            <dd>
              18
              <Cite ids={["psgc"]} prefix="PSGC 3Q 2026" />
            </dd>
          </div>
          <div>
            <dt>Economic zones supervised by PEZA</dt>
            <dd>
              436
              <Cite ids={["pezaZones"]} prefix="As of Dec 2025" />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
