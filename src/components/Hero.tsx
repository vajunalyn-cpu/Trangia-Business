import Link from "next/link";
import { GatewayHero } from "./gateway/GatewayHero";
import s from "./Hero.module.css";

export function Hero() {
  return (
    <section className={`surface-navy ${s.hero}`} aria-labelledby="hero-title">
      <GatewayHero />
      <div className={s.scrim} aria-hidden="true" />
      <div className={`wrap ${s.inner}`}>
        <div className={s.copy}>
          <h1 id="hero-title" className={`display ${s.title}`}>
            Your gateway to investment in the Philippines
          </h1>
          <p className={s.sub}>
            Trangia Business Consultancy helps investors register, incorporate and operate in the Philippines, from PEZA and BOI
            incentives to tax, accounting and compliance.
          </p>
          <div className={s.ctas}>
            <Link href="/inquire/" className="btn btn-gold">
              Inquire now
            </Link>
            <Link href="/#regions" className="btn btn-line">
              Explore investment opportunities
            </Link>
          </div>
        </div>
      </div>
      <a href="#within-reach" className={s.scroll}>
        <span className="visually-hidden">Scroll to the next section</span>
        <span className={s.scrollLine} aria-hidden="true" />
      </a>
    </section>
  );
}
