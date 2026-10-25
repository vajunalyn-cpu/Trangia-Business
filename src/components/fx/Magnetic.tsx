"use client";

import { useRef } from "react";
import { useFinePointer } from "./useFinePointer";
import s from "./fx.module.css";

/** Pulls its child gently toward the cursor while hovered. */
export function Magnetic({ children, strength = 0.28 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !fine) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <span ref={ref} className={s.magnetic} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </span>
  );
}
