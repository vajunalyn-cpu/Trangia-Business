import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import s from "../content.module.css";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How Trangia Business Consultancy handles personal data submitted through this website.",
  alternates: { canonical: "/privacy/" },
};

// DRAFT for Trangia's review. Have the Data Protection Officer confirm and complete it before launch.
export default function PrivacyPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Privacy notice" }]}
        title="Privacy notice"
        intro="How we handle the personal data you send us through this website. This notice is a draft pending review by Trangia Business Consultancy."
      />
      <section className="section surface-white on-light">
        <div className={`wrap ${s.legal}`}>
          <h2>What we collect</h2>
          <p>
            When you submit the inquiry form we receive your name, business email, company, country, and the project details you
            choose to share.
          </p>
          <h2>Why we use it</h2>
          <p>Only to reply to your inquiry and, if you engage us, to provide the services you request.</p>
          <h2>Who sees it</h2>
          <p>
            Trangia Business Consultancy staff, and the form or email service provider that delivers the inquiry to us. We do not
            sell personal data.
          </p>
          <h2>How long we keep it</h2>
          <p>For as long as needed to respond and to meet legal record-keeping obligations, then it is deleted.</p>
          <h2>Your rights</h2>
          <p>
            Under the Data Privacy Act of 2012 (Republic Act No. 10173) you may ask to access, correct or delete your personal data,
            or object to its processing. Contact details for our Data Protection Officer will be published here.
          </p>
          <h2>The calculator</h2>
          <p>The PEZA incentive calculator runs entirely in your browser. Figures you enter are not sent to us.</p>
        </div>
      </section>
    </>
  );
}
