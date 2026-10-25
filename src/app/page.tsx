import { GlobeHero } from "@/components/globe/GlobeHero";
import { GatewaySection } from "@/components/GatewaySection";
import { WithinReach } from "@/components/WithinReach";
import { Pathways } from "@/components/Pathways";
import { RegionExplorer } from "@/components/RegionExplorer";
import { ServicesJourney } from "@/components/ServicesJourney";
import { CalculatorTeaser } from "@/components/CalculatorTeaser";
import { CtaBand } from "@/components/CtaBand";

export default function Home() {
  return (
    <>
      <GlobeHero />
      <GatewaySection />
      <WithinReach />
      <Pathways />
      <RegionExplorer
        title="Explore investment locations, region by region"
        intro="Select a region to see its provinces, Trangia’s focus areas and PEZA-operated public zones. All 18 regions are drawn from Philippine Statistics Authority boundaries."
      />
      <ServicesJourney compact />
      <CalculatorTeaser />
      <CtaBand />
    </>
  );
}
