"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { regions, zones, mapViewBox, trangiaFocus, labelOffsets, groups } from "@/content/regions";
import { Cite } from "./Cite";
import { Spotlight } from "./fx/Spotlight";
import { Tilt } from "./fx/Tilt";
import s from "./RegionExplorer.module.css";

type Props = { initial?: string; headingLevel?: 2 | 3; title?: string; intro?: string };

export function RegionExplorer({
  initial = "NCR",
  title = "Explore the regions",
  intro = "Select a region to see its provinces, Trangia’s focus areas and PEZA-operated public zones. Every boundary comes from the Philippine Statistics Authority.",
}: Props) {
  const [selected, setSelected] = useState(initial);
  const [hovered, setHovered] = useState<string | null>(null);
  const [showZones, setShowZones] = useState(true);
  const uid = useId();

  const region = useMemo(() => regions.find((r) => r.code === selected)!, [selected]);
  const regionZones = zones.filter((z) => z.region === selected);
  const focus = trangiaFocus[selected];
  const labelFor = (code: string) => {
    const r = regions.find((x) => x.code === code)!;
    const [dx, dy] = labelOffsets[code] ?? [0, 0];
    return { x: r.cx + dx, y: r.cy + dy };
  };
  const active = hovered ?? selected;
  const activeLabel = labelFor(active);

  return (
    <section id="regions" className={`section surface-navy ${s.section}`} aria-labelledby={`${uid}-title`}>
      <Spotlight />
      <div className={`wrap ${s.layout}`}>
        <header className={s.head}>
          <hr className="rule-gold" />
          <h2 id={`${uid}-title`} className="h2">
            {title}
          </h2>
          <p className="lede">{intro}</p>
        </header>

        <nav className={s.list} aria-label="Regions">
          {groups.map((g) => (
            <div key={g} className={s.group}>
              <h3 className={s.groupName}>{g}</h3>
              <ul>
                {regions
                  .filter((r) => r.group === g)
                  .map((r) => (
                    <li key={r.code}>
                      <button
                        type="button"
                        className={s.item}
                        aria-pressed={selected === r.code}
                        aria-controls={`${uid}-panel`}
                        onClick={() => setSelected(r.code)}
                        onMouseEnter={() => setHovered(r.code)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(r.code)}
                        onBlur={() => setHovered(null)}
                      >
                        <span className={s.code}>{r.code}</span>
                        <span className={s.itemName}>{r.name}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={s.mobileSelect}>
          <label htmlFor={`${uid}-select`} className="small">
            Region
          </label>
          <select id={`${uid}-select`} value={selected} onChange={(e) => setSelected(e.target.value)}>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {regions
                  .filter((r) => r.group === g)
                  .map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code === r.name ? r.name : `${r.code}: ${r.name}`}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <Tilt className={s.mapWrap} max={3} glare={false}>
          <svg viewBox={mapViewBox} className={s.map} role="img" aria-label={`Map of the Philippines with ${region.name} selected`}>
            <defs>
              <radialGradient id={`${uid}-glow`}>
                <stop offset="0" stopColor="#D4AF37" stopOpacity="0.55" />
                <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g>
              {regions.map((r) => (
                <path
                  key={r.psgc}
                  d={r.d}
                  className={s.region}
                  data-selected={selected === r.code}
                  data-hovered={hovered === r.code}
                  onClick={() => setSelected(r.code)}
                  onMouseEnter={() => setHovered(r.code)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <title>{r.name}</title>
                </path>
              ))}
            </g>
            {showZones &&
              zones.map((z) => (
                <g key={z.name} transform={`translate(${z.x} ${z.y})`} className={s.zone} data-in-region={z.region === selected}>
                  <circle r="26" fill={`url(#${uid}-glow)`} />
                  <rect x="-6.5" y="-6.5" width="13" height="13" transform="rotate(45)" />
                  <title>{`${z.name}, ${z.place}`}</title>
                </g>
              ))}
            <g className={s.mapLabel} transform={`translate(${activeLabel.x} ${activeLabel.y})`} aria-hidden="true">
              <text>{regions.find((r) => r.code === active)!.code}</text>
            </g>
          </svg>
          <label className={s.toggle}>
            <input type="checkbox" checked={showZones} onChange={(e) => setShowZones(e.target.checked)} />
            <span className={s.toggleMark} aria-hidden="true" />
            PEZA-operated public zones
          </label>
        </Tilt>

        <article id={`${uid}-panel`} className={s.panel} aria-live="polite" key={region.code}>
          <p className={s.panelGroup}>
            {region.code === "NCR" || region.code === "CAR" || region.code === "BARMM" || region.code === "NIR" || region.code === "MIMAROPA"
              ? region.group
              : `Region ${region.code}, ${region.group}`}
          </p>
          <h3 className={s.panelTitle}>{region.name}</h3>
          <p className={s.area}>
            {region.areaKm2.toLocaleString("en-US")} km² land area
          </p>

          <h4 className={s.subhead}>{region.code === "NCR" ? "Districts" : "Provinces"}</h4>
          <p className={s.provinces}>{region.provinces.join(", ")}</p>

          {regionZones.length > 0 && (
            <>
              <h4 className={s.subhead}>PEZA-operated public zones</h4>
              <ul className={s.bullets}>
                {regionZones.map((z) => (
                  <li key={z.name}>
                    {z.name}, {z.place}
                  </li>
                ))}
              </ul>
            </>
          )}

          {focus ? (
            <>
              <h4 className={s.subhead}>Trangia focus areas</h4>
              <ul className={s.bullets}>
                {focus.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className={s.empty}>
              Considering {region.name}? Tell us your activity and we&rsquo;ll map the zones, incentives and permits that apply
              there.
            </p>
          )}

          <Link href={`/inquire/?region=${encodeURIComponent(region.code)}`} className={`btn btn-gold ${s.panelCta}`}>
            Ask about investing here
          </Link>
          <p className={s.sources}>
            <Cite ids={["psgc"]} prefix="Boundaries and areas" />
            <br />
            <Cite ids={["pezaPublicZones"]} prefix="Public zones" />
          </p>
        </article>
      </div>
    </section>
  );
}
