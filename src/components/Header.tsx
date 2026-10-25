"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { nav } from "@/config/site";
import { Logo } from "./Logo";
import s from "./Header.module.css";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape or outside click
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openMenu) {
          const trigger = document.getElementById(`${menuId}-${openMenu}-trigger`);
          setOpenMenu(null);
          trigger?.focus();
        }
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [openMenu, menuId]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, "")));

  return (
    <header className={`${s.header} ${scrolled || mobileOpen || pathname === "/" ? s.solid : ""}`}>
      <div className={`wrap ${s.bar}`}>
        <Link href="/" className={s.brand} aria-label="Trangia Business home">
          <Logo variant="onDark" height={40} priority />
        </Link>

        <nav ref={navRef} className={s.nav} aria-label="Main">
          <ul className={s.list}>
            {nav.map((item) =>
              item.children ? (
                <li
                  key={item.label}
                  className={s.hasMenu}
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    id={`${menuId}-${item.label}-trigger`}
                    type="button"
                    className={`${s.link} ${item.children.some((c) => isActive(c.href)) ? s.active : ""}`}
                    aria-expanded={openMenu === item.label}
                    aria-controls={`${menuId}-${item.label}`}
                    onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                  >
                    {item.label}
                    <svg className={s.caret} width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
                      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                  <div id={`${menuId}-${item.label}`} className={s.menu} data-open={openMenu === item.label} hidden={openMenu !== item.label}>
                    <ul>
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className={s.menuItem} aria-current={isActive(c.href) ? "page" : undefined}>
                            <span className={s.menuTitle}>{c.label}</span>
                            <span className={s.menuDesc}>{c.description}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className={`${s.link} ${isActive(item.href) ? s.active : ""}`} aria-current={isActive(item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <Link href="/inquire/" className={`btn btn-gold ${s.cta}`}>
          Inquire now
        </Link>

        <button
          type="button"
          className={s.burger}
          aria-expanded={mobileOpen}
          aria-controls={`${menuId}-mobile`}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span className="visually-hidden">{mobileOpen ? "Close menu" : "Open menu"}</span>
          <span className={s.burgerLines} data-open={mobileOpen} aria-hidden="true" />
        </button>
      </div>

      <div id={`${menuId}-mobile`} className={s.mobile} hidden={!mobileOpen}>
        <nav aria-label="Mobile" className="wrap">
          <ul>
            {nav.map((item) =>
              item.children ? (
                <li key={item.label}>
                  <details className={s.mDetails} open>
                    <summary>{item.label}</summary>
                    <ul>
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className={s.mSub}>
                            <span>{c.label}</span>
                            <span className={s.menuDesc}>{c.description}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className={s.mLink} aria-current={isActive(item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
          <Link href="/inquire/" className={`btn btn-gold ${s.mCta}`}>
            Inquire now
          </Link>
        </nav>
      </div>
    </header>
  );
}
