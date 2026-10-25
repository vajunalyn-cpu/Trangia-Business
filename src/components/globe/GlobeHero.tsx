"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { media } from "@/config/brand";
import { Magnetic } from "../fx/Magnetic";
import s from "./GlobeHero.module.css";

const PLATE_SRC = `${media.globeRender.base}-1536.webp`;
const LOGO_SRC = "/brand/trangia-logo-globe-gold.png";

/**
 * Home hero. The client's globe render is the stage; a live Three.js globe is drawn exactly
 * over the globe in the render, the pedestal is layered back on top, and the gold logo floats
 * in front. Until the 3D scene is ready (or without WebGL) the render itself is what shows.
 */
export function GlobeHero() {
  const areaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [dragged, setDragged] = useState(false);
  const [overGlobe, setOverGlobe] = useState(false);

  useEffect(() => {
    const area = areaRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!area || !stage || !canvas) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [{ GlobeScene }, THREE] = await Promise.all([import("./globeScene"), import("three")]);
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;
      const texture = await new THREE.TextureLoader().loadAsync("/geo/land-mask.png");
      if (disposed) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scene = new GlobeScene(canvas, texture, { reducedMotion: reduced });

      const measure = () => {
        const a = area.getBoundingClientRect();
        const st = stage.getBoundingClientRect();
        scene.setLayout({ width: a.width, height: a.height, scale: st.width / 1536, ox: st.left - a.left, oy: st.top - a.top });
      };
      const ro = new ResizeObserver(measure);
      ro.observe(area);
      measure();

      // Pointer: parallax everywhere in the hero, hover glow and drag-to-spin over the globe
      let dragId: number | null = null;
      const local = (e: PointerEvent) => {
        const a = area.getBoundingClientRect();
        return { x: e.clientX - a.left, y: e.clientY - a.top, w: a.width, h: a.height };
      };
      const onMove = (e: PointerEvent) => {
        const p = local(e);
        const nx = (p.x / p.w) * 2 - 1;
        const ny = (p.y / p.h) * 2 - 1;
        if (e.pointerType === "mouse") {
          scene.setPointer(nx, ny);
          area.style.setProperty("--px", nx.toFixed(3));
          area.style.setProperty("--py", ny.toFixed(3));
          const over = scene.hit(p.x, p.y);
          scene.setHover(over);
          setOverGlobe(over);
        }
        if (dragId === e.pointerId) scene.dragMove(e.clientX, e.movementY);
      };
      const onDown = (e: PointerEvent) => {
        const p = local(e);
        if (!scene.hit(p.x, p.y)) return;
        dragId = e.pointerId;
        area.setPointerCapture(e.pointerId);
        scene.dragStart(e.clientX);
        area.dataset.dragging = "true";
        setDragged(true);
      };
      const onUp = (e: PointerEvent) => {
        if (dragId !== e.pointerId) return;
        dragId = null;
        scene.dragEnd();
        delete area.dataset.dragging;
      };
      const onLeave = () => {
        scene.setHover(false);
        scene.setPointer(0, 0);
        setOverGlobe(false);
        area.style.setProperty("--px", "0");
        area.style.setProperty("--py", "0");
      };
      area.addEventListener("pointermove", onMove);
      area.addEventListener("pointerdown", onDown);
      area.addEventListener("pointerup", onUp);
      area.addEventListener("pointercancel", onUp);
      area.addEventListener("pointerleave", onLeave);

      let inView = true;
      const update = () => (inView && !document.hidden && !reduced ? scene.start() : scene.stop());
      const io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        update();
      });
      io.observe(area);
      document.addEventListener("visibilitychange", update);
      update();
      scene.renderOnce();
      setReady(true);

      cleanup = () => {
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", update);
        area.removeEventListener("pointermove", onMove);
        area.removeEventListener("pointerdown", onDown);
        area.removeEventListener("pointerup", onUp);
        area.removeEventListener("pointercancel", onUp);
        area.removeEventListener("pointerleave", onLeave);
        scene.dispose();
      };
    })().catch((err) => console.warn("Globe unavailable, showing the still render.", err));

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <div ref={areaRef} className={s.area} data-ready={ready} data-over={overGlobe}>
        <div ref={stageRef} className={`${s.stage} ${s.back}`} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PLATE_SRC} alt="" className={s.plate} fetchPriority="high" />
        </div>
        <canvas ref={canvasRef} className={s.canvas} aria-hidden="true" />
        <div className={`${s.stage} ${s.front}`} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PLATE_SRC} alt="" className={`${s.plate} ${s.pedestal}`} />
          <div className={s.logo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="" />
            <span className={s.shimmer} />
          </div>
        </div>
        <p className={s.hint} data-hidden={dragged || !ready} aria-hidden="true">
          Drag to turn the globe
        </p>
      </div>

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
            <Magnetic>
              <Link href="/inquire/" className="btn btn-gold">
                Inquire now
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/#gateway" className="btn btn-ghost-dark">
                Explore investment opportunities
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
