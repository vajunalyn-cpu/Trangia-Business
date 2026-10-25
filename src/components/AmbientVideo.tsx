"use client";

import { useEffect, useRef, useState } from "react";

/** Muted background loop. Loads only near the viewport; shows the poster for reduced motion. */
export function AmbientVideo({ mp4, webm, poster }: { mp4: string; webm?: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => setPlay(e.isIntersecting), { rootMargin: "200px" });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (play) v.play().catch(() => {});
    else v.pause();
  }, [play]);

  return (
    <video ref={ref} muted loop playsInline preload="none" poster={poster} aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover" }}>
      {webm && <source src={webm} type="video/webm" />}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
