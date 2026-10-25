"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GatewayHero } from "./gateway/GatewayHero";
import { Cite } from "./Cite";
import s from "./GatewaySection.module.css";

const STEPS = [
  {
    title: "Between North and Southeast Asia",
    body: "Ten of the region's major business hubs, from Tokyo to Jakarta, lie within 3,000 km of Manila.",
  },
  {
    title: "An archipelago of 18 regions",
    body: "Luzon, the Visayas and Mindanao, each region with its own industries, zones and local incentives.",
  },
  {
    title: "Economic zones nationwide",
    body: "436 economic zones under PEZA as of December 2025. We help you find the location and registration that fit.",
  },
];

/** Scroll-driven 3D archipelago: the camera flies in as the visitor scrolls through three captions. */
export function GatewaySection() {
  const trackRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);

  const progress = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const range = Math.max(1, r.height - window.innerHeight);
    return Math.min(1, Math.max(0, -r.top / range));
  }, []);

  useEffect(() => {
    const onScroll = () => setStep(Math.min(STEPS.length - 1, Math.floor(progress() * STEPS.length * 0.999)));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [progress]);

  return (
    <section id="gateway" ref={trackRef} className={`surface-navy ${s.track}`} aria-labelledby="gateway-title">
      <div className={s.sticky}>
        <GatewayHero progress={progress} />
        <div className={s.scrim} aria-hidden="true" />
        <div className={`wrap ${s.inner}`}>
          <h2 id="gateway-title" className="visually-hidden">
            The Philippines as a gateway
          </h2>
          <ol className={s.steps}>
            {STEPS.map((st, i) => (
              <li key={st.title} className={s.step} data-active={i === step} aria-current={i === step ? "step" : undefined}>
                <h3 className={s.title}>{st.title}</h3>
                <p className={s.body}>{st.body}</p>
              </li>
            ))}
          </ol>
          <div className={s.foot}>
            <div className={s.ticks} aria-hidden="true">
              {STEPS.map((st, i) => (
                <span key={st.title} data-active={i <= step} />
              ))}
            </div>
            <Link href="#regions" className="btn btn-line">
              Explore the regions
            </Link>
            <p className={s.cite}>
              <Cite ids={["psgc", "pezaZones"]} />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
