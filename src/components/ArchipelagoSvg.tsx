import { regions, mapViewBox } from "@/content/regions";

/** Static gold-on-navy Philippines outline from PSA boundaries. Used as a fallback and as decoration. */
export function ArchipelagoSvg({ className }: { className?: string }) {
  return (
    <svg viewBox={mapViewBox} className={className} role="presentation" focusable="false">
      <defs>
        <linearGradient id="arch-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8D5A8" stopOpacity="0.28" />
          <stop offset="1" stopColor="#D4AF37" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      {regions.map((r) => (
        <path key={r.psgc} d={r.d} fill="url(#arch-fill)" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.8" />
      ))}
    </svg>
  );
}
