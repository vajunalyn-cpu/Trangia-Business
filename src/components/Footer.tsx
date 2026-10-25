import Link from "next/link";
import { site, nav } from "@/config/site";
import { Logo } from "./Logo";
import s from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();
  const links = nav.flatMap((n) => (n.children ? n.children : [n]));
  const { email, phone, address } = site.contact;
  return (
    <footer className={`surface-navy ${s.footer}`}>
      <div className={`wrap ${s.grid}`}>
        <div className={s.brand}>
          <Logo variant="onDark" height={48} />
          <p className={s.tag}>{site.tagline}</p>
        </div>
        <nav aria-label="Footer" className={s.col}>
          <h2 className={s.h}>Explore</h2>
          <ul>
            {links.map((l) => (
              <li key={l.href + l.label}>
                <Link href={l.href}>{l.label === "PEZA" || l.label === "BOI" ? `${l.label} investment` : l.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/peza/#calculator">PEZA incentive calculator</Link>
            </li>
          </ul>
        </nav>
        <div className={s.col}>
          <h2 className={s.h}>Contact</h2>
          {email || phone || address ? (
            <ul>
              {address && <li>{address}</li>}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              )}
            </ul>
          ) : (
            <p className={s.note}>Send us your project details through the inquiry form and a consultant will reply.</p>
          )}
          <Link href="/inquire/" className="btn btn-gold" style={{ marginTop: "1.25rem" }}>
            Inquire now
          </Link>
        </div>
      </div>
      <div className={`wrap ${s.legal}`}>
        <p>
          © {year} {site.name}
        </p>
        <p>
          Trangia Business is a private consultancy, not a government agency. PEZA and BOI decide all registrations and incentives.
        </p>
        <Link href="/privacy/">Privacy notice</Link>
      </div>
    </footer>
  );
}
