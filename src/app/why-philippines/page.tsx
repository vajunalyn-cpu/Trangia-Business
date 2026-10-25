import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { WithinReach } from "@/components/WithinReach";
import { RegionExplorer } from "@/components/RegionExplorer";
import { Pathways } from "@/components/Pathways";
import { CtaBand } from "@/components/CtaBand";
import { Cite } from "@/components/Cite";
import { media } from "@/config/brand";
import s from "../content.module.css";

export const metadata: Metadata = {
  title: "Why invest in the Philippines",
  description:
    "The Philippines' location between North and Southeast Asia, its 18 regions, economic zones and investment incentives, with an interactive regional map.",
  alternates: { canonical: "/why-philippines/" },
};

export default function WhyPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Why Philippines" }]}
        title="A base between North and Southeast Asia"
        intro="An archipelago of 18 regions on the Pacific edge of Asia, with a large English-speaking population, hundreds of economic zones, and incentives reformed in 2021 and 2024."
        media={media.manilaSkyline}
      >
        <Link href="#regions" className="btn btn-gold">
          Explore the regions
        </Link>
      </PageHero>

      <WithinReach />

      <section className="section surface-white on-light" aria-labelledby="why-points">
        <div className="wrap">
          <hr className="rule-gold" />
          <h2 id="why-points" className="h2">
            What investors work with
          </h2>
          <dl className={s.defs}>
            <div>
              <dt>English in business and government</dt>
              <dd>Filipino and English are the official languages under the 1987 Constitution, and English is widely used in law, business and education.</dd>
            </div>
            <div>
              <dt>A large domestic market</dt>
              <dd>
                112.7 million people at the 2024 census. <Cite ids={["popcen"]} prefix="Source" />
              </dd>
            </div>
            <div>
              <dt>Zones ready to occupy</dt>
              <dd>
                436 economic zones under PEZA as of December 2025, most of them IT parks and centres.{" "}
                <Cite ids={["pezaZones"]} prefix="Source" />
              </dd>
            </div>
            <div>
              <dt>Reformed incentives</dt>
              <dd>
                The CREATE Act (2021) and CREATE MORE Act (2024) set income tax holidays followed by SCIT or enhanced deductions, and
                lowered the regular corporate income tax rate to 25%. <Cite ids={["ra11534", "ra12066"]} prefix="Source" />
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <RegionExplorer />
      <Pathways />
      <CtaBand />
    </>
  );
}
