import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ServicesJourney } from "@/components/ServicesJourney";
import { Pathways } from "@/components/Pathways";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Business registration and licensing, PEZA and BOI registration assistance, taxation and compliance, accounting, audit and assurance, and business advisory in the Philippines.",
  alternates: { canonical: "/services/" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        title="Everything a new investor needs, handled by one team"
        intro="Trangia Business Consultancy covers company setup, investment registration, tax, accounting, audit and advisory, so your project moves from plan to operation without hand-offs between firms."
      >
        <Link href="/inquire/" className="btn btn-gold">
          Inquire now
        </Link>
      </PageHero>
      <ServicesJourney />
      <Pathways />
      <CtaBand />
    </>
  );
}
