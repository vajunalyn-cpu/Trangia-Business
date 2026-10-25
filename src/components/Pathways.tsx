import Link from "next/link";
import { regions, zones, mapViewBox } from "@/content/regions";
import { Tilt } from "./fx/Tilt";
import s from "./Pathways.module.css";

// BOI-registered projects can be located across the country; these sample points are
// region label anchors, used only to illustrate "anywhere", not actual projects.
const spread = ["I", "III", "IV-A", "V", "VI", "VII", "VIII", "X", "XI", "XII", "XIII", "CAR"].map((c) => regions.find((r) => r.code === c)!);

function MiniMap({ mode }: { mode: "peza" | "boi" }) {
  return (
    <svg viewBox={mapViewBox} className={s.mini} aria-hidden="true" focusable="false">
      {regions.map((r) => (
        <path key={r.psgc} d={r.d} className={s.miniLand} />
      ))}
      {mode === "peza"
        ? zones.map((z) => (
            <g key={z.name} transform={`translate(${z.x} ${z.y})`}>
              <circle r="34" className={s.ring} />
              <circle r="11" className={s.dot} />
            </g>
          ))
        : spread.map((r) => <circle key={r.code} cx={r.cx} cy={r.cy} r="11" className={s.dot} />)}
    </svg>
  );
}

export function Pathways() {
  return (
    <section className="section surface-white on-light" aria-labelledby="pathways-title">
      <div className="wrap">
        <div className={s.head}>
          <hr className="rule-gold" />
          <h2 id="pathways-title" className="h2">
            Two main routes to investment incentives
          </h2>
          <p className="lede">
            Which one fits depends on where your project will operate and what it does. We help you choose before anything is
            filed.
          </p>
        </div>

        <div className={s.grid}>
          <Tilt as="article" className={s.route} max={4}>
            <MiniMap mode="peza" />
            <div className={s.body}>
              <h3 className="h3">PEZA</h3>
              <p className={s.key}>Location-based: your activity operates inside a registered economic zone or IT park.</p>
              <dl className={s.facts}>
                <div>
                  <dt>Suits</dt>
                  <dd>Export manufacturing, IT-BPM, logistics, agro-industrial and tourism operations within a zone</dd>
                </div>
                <div>
                  <dt>Incentives</dt>
                  <dd>Income tax holiday, then SCIT or enhanced deductions, subject to registration</dd>
                </div>
              </dl>
              <div className={s.links}>
                <Link href="/peza/" className="btn btn-navy">
                  Explore PEZA
                </Link>
                <Link href="/peza/#calculator" className="text-link">
                  Estimate incentives
                </Link>
              </div>
            </div>
          </Tilt>

          <Tilt as="article" className={s.route} max={4}>
            <MiniMap mode="boi" />
            <div className={s.body}>
              <h3 className="h3">BOI</h3>
              <p className={s.key}>Activity-based: a priority project under the Strategic Investment Priority Plan, almost anywhere in the country.</p>
              <dl className={s.facts}>
                <div>
                  <dt>Suits</dt>
                  <dd>Projects outside economic zones in activities listed in the SIPP, including energy, manufacturing and innovation</dd>
                </div>
                <div>
                  <dt>Incentives</dt>
                  <dd>Depend on the project&rsquo;s SIPP tier and location; approval is not automatic</dd>
                </div>
              </dl>
              <div className={s.links}>
                <Link href="/boi/" className="btn btn-navy">
                  Explore BOI
                </Link>
              </div>
            </div>
          </Tilt>
        </div>
        <p className={`small muted ${s.note}`}>
          Other investment promotion agencies administer freeports and special zones such as Clark and Subic. Tell us about your
          project and we&rsquo;ll identify the right agency.
        </p>
      </div>
    </section>
  );
}
