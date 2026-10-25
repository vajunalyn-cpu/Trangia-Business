"use client";

import { useEffect, useState } from "react";

/** True only for a mouse or trackpad user who hasn't asked for reduced motion. */
export function useFinePointer() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => setOk(q.matches);
    update();
    q.addEventListener("change", update);
    return () => q.removeEventListener("change", update);
  }, []);
  return ok;
}
