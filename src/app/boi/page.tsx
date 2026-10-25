import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Steps } from "@/components/Steps";
import { Cite } from "@/components/Cite";
import { CtaBand } from "@/components/CtaBand";
import { media } from "@/config/brand";
import s from "../content.module.css";

export const metadata: Metadata = {
  title: "BOI registration for priority projects",
  description:
    "How Board of Investments registration works under the 2026 Strategic Investment Priority Plan, the Green Lane for strategic investments, and how Trangia Business helps investors apply.",
  alternates: { canonical: "/boi/" },
};

export default function BoiPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Foreign investment" }, { label: "BOI" }]}
        title="Register a priority project with the Board of Investments"
        intro="The BOI, attached to the Department of Trade and Industry, registers projects in activities listed in the Strategic Investment Priority Plan and grants the incentives the law allows them. Projects can be located almost anywhere in the country."
        media={media.boiRenewables}
      >
        <Link href="/inquire/?topic=boi" className="btn btn-gold">
          Ask about BOI registration
        </Link>
        <Link href="/#regions" className="btn btn-line">
          Explore regions
        </Link>
      </PageHero>

      <section className="section surface-ivory on-light" aria-labelledby="sipp">
        <div className="wrap">
          <hr className="rule-gold" />
          <h2 id="sipp" className="h2">
            The 2026 Strategic Investment Priority Plan
          </h2>
          <p className={`lede ${s.leadGap}`}>
            The SIPP lists the activities that can receive incentives and sorts them into three tiers. A higher tier generally
            means a longer incentive period. The 2026 plan took effect on 17 June 2026.
          </p>
          <div className={s.tiers}>
            <article className={s.tier}>
              <h3 className={s.tierName}>Tier I</h3>
              <p className={s.tierBody}>Modern basic needs and sustainability-driven industries.</p>
            </article>
            <article className={s.tier}>
              <h3 className={s.tierName}>Tier II</h3>
              <p className={s.tierBody}>Defense, industrial value-chain gaps and food security.</p>
            </article>
            <article className={s.tier}>
              <h3 className={s.tierName}>Tier III</h3>
              <p className={s.tierBody}>Science, technology and innovation.</p>
            </article>
          </div>
          <p className={s.cite}>
            <Cite ids={["sipp2026"]} /> Your exact activity must appear in the SIPP list; we check it before you apply.
          </p>
        </div>
      </section>

      <section className="section surface-white on-light" aria-labelledby="boi-how">
        <div className="wrap">
          <hr className="rule-gold" />
          <h2 id="boi-how" className="h2">
            How BOI registration usually works
          </h2>
          <p className={`lede ${s.leadGap}`}>
            A general overview. Incentives are not automatic: each project is evaluated, and larger projects are approved by the
            Fiscal Incentives Review Board rather than the BOI.
          </p>
          <div className={s.stepsGap}>
            <Steps
              steps={[
                { title: "Match the activity", body: "Find your activity and tier in the SIPP and confirm BOI is the right agency." },
                { title: "Build the project file", body: "Project study, financial projections and corporate documents prepared to BOI's requirements." },
                { title: "File and respond", body: "Submit the application and answer BOI's evaluation questions." },
                { title: "Registration", body: "Approved projects receive registration terms covering the activity, capacity and incentives." },
                { title: "Avail and report", body: "Claim incentives with the tax and customs authorities and file BOI's periodic reports." },
              ]}
            />
          </div>
          <p className={s.cite}>
            <Cite ids={["boi", "ra11534"]} />
          </p>
        </div>
      </section>

      <section className="section surface-white on-light" aria-labelledby="green-lane" style={{ paddingTop: 0 }}>
        <div className={`wrap ${s.split}`}>
          <div className={s.callout}>
            <h2 id="green-lane" className="h3">
              Green Lane for strategic investments
            </h2>
            <p>
              Executive Order No. 18 (2023) set up a one-stop action center at the BOI that coordinates permits across national
              agencies and local governments for strategic investments. The BOI reported 203 projects in the Green Lane in April
              2025.
            </p>
            <p className={s.cite}>
              <Cite ids={["greenLane"]} />
            </p>
          </div>
          <div className={s.prose}>
            <h3 className="h3" style={{ color: "var(--ink)" }}>
              Where we help
            </h3>
            <p>
              We check your activity against the SIPP, prepare the project file, coordinate with the BOI through evaluation, and
              then handle the tax filings and reports that keep the incentives in place.
            </p>
            <p>
              <Link href="/services/" className="text-link">
                See our services
              </Link>
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        title="Is your project on the priority list?"
        body="Send us the activity, investment size and location. We'll check it against the 2026 SIPP and outline the registration route."
      />
    </>
  );
}
