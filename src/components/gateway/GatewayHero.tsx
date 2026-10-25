"use client";

import { useEffect, useRef, useState } from "react";
import { ArchipelagoSvg } from "../ArchipelagoSvg";
import s from "./GatewayHero.module.css";

type Label = { name: string; x: number; y: number; visible: boolean };

/**
 * Interactive 3D gateway map. The Three.js bundle and the geodata load only after the
 * page is interactive; until then (and without WebGL) a static SVG of the same
 * boundaries is shown, so the hero never waits on the 3D scene.
 */
export function GatewayHero({ progress }: { progress?: () => number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const { GatewayScene, webglAvailable } = await import("./scene");
      if (!webglAvailable()) {
        setFailed(true);
        return;
      }
      const res = await fetch("/geo/gateway.json");
      if (!res.ok) throw new Error(`gateway.json ${res.status}`);
      const data = await res.json();
      if (disposed) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      let lastLabels = "";
      const scene = new GatewayScene(canvas, data, {
        reducedMotion: reduced.matches,
        onLabels: (l) => {
          // Avoid re-rendering React every frame when nothing moved meaningfully.
          const key = l.map((x) => `${x.visible ? 1 : 0}${Math.round(x.x / 2)},${Math.round(x.y / 2)}`).join("|");
          if (key !== lastLabels) {
            lastLabels = key;
            setLabels(l);
          }
        },
      });

      const ro = new ResizeObserver(() => scene.resize(host.clientWidth, host.clientHeight));
      ro.observe(host);
      scene.resize(host.clientWidth, host.clientHeight);

      const onScroll = () => scene.setProgress(progress ? progress() : window.scrollY / Math.max(1, host.clientHeight * 0.9));
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      const onPointer = (e: PointerEvent) => {
        scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
      };
      if (!reduced.matches) window.addEventListener("pointermove", onPointer, { passive: true });

      // Only animate while the hero is on screen and the tab is visible.
      let inView = true;
      const update = () => (inView && !document.hidden && !reduced.matches ? scene.start() : scene.stop());
      const io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        update();
      });
      io.observe(host);
      document.addEventListener("visibilitychange", update);
      update();
      scene.renderOnce();
      setReady(true);

      cleanup = () => {
        ro.disconnect();
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", update);
        scene.dispose();
      };
    })().catch((err) => {
      console.warn("Gateway scene unavailable, showing static map.", err);
      setFailed(true);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={hostRef} className={s.host} data-ready={ready && !failed}>
      <div className={s.fallback} aria-hidden="true">
        <ArchipelagoSvg className={s.fallbackSvg} />
      </div>
      <canvas ref={canvasRef} className={s.canvas} aria-hidden="true" />
      <ul className={s.labels} aria-hidden="true">
        {ready &&
          !failed &&
          labels.map((l) => (
            <li key={l.name} className={s.label} style={{ transform: `translate(${l.x}px, ${l.y}px)`, opacity: l.visible ? 1 : 0 }}>
              {l.name}
            </li>
          ))}
      </ul>
    </div>
  );
}
