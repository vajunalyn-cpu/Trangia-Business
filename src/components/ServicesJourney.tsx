import Link from "next/link";
import { services } from "@/content/services";
import { media } from "@/config/brand";
import { MediaSlot } from "./MediaSlot";
import s from "./ServicesJourney.module.css";

/** The services in the order an investor typically needs them: a real sequence, so it is numbered. */
export function ServicesJourney({ compact = false }: { compact?: boolean }) {
  return (
    <section className="section surface-white on-light" aria-labelledby="journey-title">
      <div className={`wrap ${s.layout}`}>
        <div className={s.intro}>
          <hr className="rule-gold" />
          <h2 id="journey-title" className="h2">
            From first inquiry to an operating company
          </h2>
          <p className="lede">
            One team for each step a new investor goes through, in the order you&rsquo;ll need them. Start at any point.
          </p>
          <figure className={s.figure}>
            <MediaSlot slot={media.receptionRender} sizes="(max-width: 900px) 100vw, 40vw" />
            <figcaption className="cite">Trangia Business Consultancy reception (concept render)</figcaption>
          </figure>
        </div>

        <ol className={s.steps}>
          {services.map((svc, i) => (
            <li key={svc.id} className={s.step} id={`service-${svc.id}`}>
              <span className={s.num} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className={s.stage}>{svc.stage}</p>
                <h3 className={s.title}>{svc.title}</h3>
                <p className={s.summary}>{svc.summary}</p>
                {!compact && (
                  <ul className={s.includes}>
                    {svc.includes.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
        {compact && (
          <div className={s.more}>
            <Link href="/services/" className="btn btn-navy">
              See what each service includes
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
