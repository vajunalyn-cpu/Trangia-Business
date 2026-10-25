import Link from "next/link";
import type { MediaSlot as Slot } from "@/config/brand";
import { MediaSlot } from "./MediaSlot";
import s from "./PageHero.module.css";

type Crumb = { label: string; href?: string };

export function PageHero({
  crumbs,
  title,
  intro,
  media,
  children,
}: {
  crumbs: Crumb[];
  title: string;
  intro: string;
  media?: Slot;
  children?: React.ReactNode;
}) {
  return (
    <section className={`surface-navy ${s.hero}`} aria-labelledby="page-title">
      <div className={`wrap ${s.grid}`} data-has-media={!!media}>
        <div className={s.copy}>
          <nav aria-label="Breadcrumb" className={s.crumbs}>
            <ol>
              {crumbs.map((c, i) => (
                <li key={c.label}>
                  {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current={i === crumbs.length - 1 ? "page" : undefined}>{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
          <h1 id="page-title" className={`display ${s.title}`}>
            {title}
          </h1>
          <p className={s.intro}>{intro}</p>
          {children && <div className={s.actions}>{children}</div>}
        </div>
        {media && (
          <div className={s.media}>
            <MediaSlot slot={media} sizes="(max-width: 900px) 100vw, 50vw" priority />
          </div>
        )}
      </div>
    </section>
  );
}
