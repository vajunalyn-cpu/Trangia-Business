import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { InquiryForm } from "@/components/InquiryForm";
import s from "../content.module.css";

export const metadata: Metadata = {
  title: "Inquire now",
  description: "Tell Trangia Business Consultancy about your investment project in the Philippines and get a reply from a consultant.",
  alternates: { canonical: "/inquire/" },
};

export default function InquirePage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Inquire now" }]}
        title="Tell us about your project"
        intro="A consultant will reply with the registration route that fits, what it involves, and what we'd need from you to start."
      />
      <section className="section surface-ivory on-light">
        <div className={`wrap ${s.formLayout}`}>
          <div className={s.prose} style={{ marginTop: 0 }}>
            <h2 className="h3" style={{ color: "var(--ink)" }}>
              What happens next
            </h2>
            <p>We read every inquiry and reply by email, usually with a few questions about the activity, size and location.</p>
            <p>
              If incentives may apply, we&rsquo;ll say which agency fits, PEZA, BOI or another, and outline the documents and
              timeline.
            </p>
            <p>Nothing you send commits you to anything.</p>
          </div>
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
