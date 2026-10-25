"use client";

import { useRef } from "react";
import { useFinePointer } from "./useFinePointer";
import s from "./fx.module.css";

type Props = {
  children: React.ReactNode;
  className?: string;
  max?: number; // degrees
  glare?: boolean;
  as?: "div" | "article" | "li" | "figure";
} & React.HTMLAttributes<HTMLElement>;

/** 3D tilt toward the cursor with a moving light glare. Inert for touch and reduced motion. */
export function Tilt({ children, className = "", max = 6, glare = true, as: Tag = "div", ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const frame = useRef(0);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !fine) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
      el.dataset.tilting = "true";
    });
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.tilting;
  };

  const Comp = Tag as React.ElementType;
  return (
    <Comp ref={ref} className={`${s.tilt} ${className}`} onPointerMove={move} onPointerLeave={leave} {...rest}>
      {children}
      {glare && <span className={s.glare} aria-hidden="true" />}
    </Comp>
  );
}
