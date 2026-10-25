import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export default function NotFound() {
  return (
    <PageHero
      crumbs={[{ label: "Home", href: "/" }, { label: "Page not found" }]}
      title="This page isn't here"
      intro="The link may be out of date. Start from the home page, or tell us what you were looking for."
    >
      <Link href="/" className="btn btn-gold">
        Go to the home page
      </Link>
      <Link href="/inquire/" className="btn btn-line">
        Inquire now
      </Link>
    </PageHero>
  );
}
