import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Steps } from "@/components/Steps";
import { Cite } from "@/components/Cite";
import { PezaCalculator } from "@/components/calculator/PezaCalculator";
import { CtaBand } from "@/components/CtaBand";
import { media } from "@/config/brand";
import s from "../content.module.css";

export const metadata: Metadata = {
  title: "PEZA registration and incentive calculator",
  description:
    "How PEZA registration works for enterprises in Philippine economic zones and IT parks, the incentives under the CREATE and CREATE MORE laws, and a calculator to estimate them.",
  alternates: { canonical: "/peza/" },
};

// Reported breakdown of the 436 economic zones PEZA supervised as of December 2025.
const zoneTypes = [
  { label: "IT parks and centres", n: 309 },
  { label: "Manufacturing economic zones", n: 83 },
  { label: "Agro-industrial economic zones", n: 24 },
  { label: "Tourism economic zones", n: 17 },
  { label: "Medical tourism parks and centres", n: 3 },
];
const zoneTotal = zoneTypes.reduce((a, b) => a + b.n, 0);

export default function PezaPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Foreign investment" }, { label: "PEZA" }]}
        title="Operate inside a Philippine economic zone"
        intro="The Philippine Economic Zone Authority registers enterprises that operate in economic zones and IT parks, and administers the incentives they can claim. We prepare the registration with you and keep it in good standing."
        media={media.pezaEcozone}
      >
        <Link href="#calculator" className="btn btn-gold">
          Estimate your incentives
        </Link>
        <Link href="/inquire/?topic=peza" className="btn btn-line">
          Ask about PEZA registration
        </Link>
      </PageHero>

      <section className="section surface-white on-light" aria-labelledby="peza-zones">
        <div className={`wrap ${s.split}`}>
          <div>
            <hr className="rule-gold" />
            <h2 id="peza-zones" className="h2">
              What PEZA is
            </h2>
            <div className={s.prose}>
              <p>
                PEZA was created by the Special Economic Zone Act of 1995 (Republic Act No. 7916) and is attached to the Department
                of Trade and Industry. It is one of the government&rsquo;s investment promotion agencies.
              </p>
              <p>
                Most zones are developed and run by private companies; PEZA registers them and the enterprises that locate inside.
                PEZA also operates a small number of public zones itself, including Baguio City, Cavite, Mactan and Pampanga.
              </p>
            </div>
            <p className={s.cite}>
              <Cite ids={["peza", "pezaPublicZones"]} />
            </p>
          </div>
          <figure className={`surface-navy ${s.figure}`}>
            <figcaption className={s.figTitle}>
              <span className={s.big}>{zoneTotal}</span> economic zones supervised by PEZA, December 2025
            </figcaption>
            <div className={s.stack} aria-hidden="true">
              {zoneTypes.map((z) => (
                <span key={z.label} style={{ flexGrow: z.n }} />
              ))}
            </div>
            <dl className={s.breakdown}>
              {zoneTypes.map((z) => (
                <div key={z.label}>
                  <dt>{z.label}</dt>
                  <dd>{z.n}</dd>
                </div>
              ))}
            </dl>
            <p className={s.cite}>
              <Cite ids={["pezaZones"]} /> Reported figures; confirm the current count with PEZA.
            </p>
          </figure>
        </div>
      </section>

      <section className="section surface-white on-light" aria-labelledby="peza-incentives" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <hr className="rule-gold" />
          <h2 id="peza-incentives" className="h2">
            Incentives a registered project can receive
          </h2>
          <p className={`lede ${s.leadGap}`}>
            Incentives come from the National Internal Revenue Code as amended by the CREATE Act (2021) and CREATE MORE Act (2024).
            Each project gets only what its registration approves.
          </p>
          <dl className={s.defs}>
            <div>
              <dt>Income tax holiday (ITH)</dt>
              <dd>No corporate income tax for 4 to 7 years, depending on the project&rsquo;s priority tier and location.</dd>
            </div>
            <div>
              <dt>Special corporate income tax (SCIT)</dt>
              <dd>
                For export enterprises after the ITH: 5% of gross income earned, in place of all national and local taxes (3%
                national, 2% local).
              </dd>
            </div>
            <div>
              <dt>Enhanced Deduction Regime (EDR)</dt>
              <dd>
                The alternative to SCIT, and the only option for domestic market enterprises: a 20% income tax rate plus additional
                deductions for items such as power, labour, training and research.
              </dd>
            </div>
            <div>
              <dt>Duty and VAT</dt>
              <dd>
                Registered export enterprises may also receive duty exemption on imported capital equipment, raw materials and
                supplies, and VAT relief on imports and local purchases used directly and exclusively in the registered activity.
              </dd>
            </div>
          </dl>
          <p className={s.cite}>
            <Cite ids={["ra11534", "ra12066", "createMoreIncentives", "rbelt"]} />
          </p>
        </div>
      </section>

      <section className="section surface-ivory on-light" aria-labelledby="peza-process">
        <div className="wrap">
          <hr className="rule-gold" />
          <h2 id="peza-process" className="h2">
            How registration usually works
          </h2>
          <p className={`lede ${s.leadGap}`}>
            A general overview. Documents and timelines change, so we confirm PEZA&rsquo;s current checklist for every project.
          </p>
          <div className={s.stepsGap}>
            <Steps
              steps={[
                { title: "Check fit", body: "Confirm the activity qualifies and that PEZA, rather than another agency, is the right route." },
                { title: "Secure a location", body: "Arrange space with a registered zone or IT park, whose developer confirms your entry." },
                { title: "Prepare the application", body: "Project profile, corporate documents and projections, assembled and filed with PEZA." },
                { title: "Evaluation and approval", body: "PEZA reviews the application; approved projects receive registration terms setting out activity and incentives." },
                { title: "Operate and report", body: "Meet reporting, import and export, and renewal requirements to keep incentives in place." },
              ]}
            />
          </div>
        </div>
      </section>

      <PezaCalculator />

      <CtaBand
        title="Planning a project in an economic zone?"
        body="Tell us the activity, size and preferred location. We'll confirm whether PEZA is the right agency and what registration involves."
      />
    </>
  );
}
