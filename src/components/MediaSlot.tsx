import type { MediaSlot as Slot } from "@/config/brand";
import { ArchipelagoSvg } from "./ArchipelagoSvg";
import s from "./MediaSlot.module.css";

type Props = { slot: Slot; sizes: string; className?: string; priority?: boolean };

/**
 * Responsive image for a replaceable media slot. When the asset hasn't been placed in
 * /public yet (slot.available === false) a designed navy-and-gold panel renders instead,
 * so layouts never show a broken image.
 */
export function MediaSlot({ slot, sizes, className, priority }: Props) {
  if (!slot.available) {
    return (
      <div className={`${s.fallback} ${className ?? ""}`} role="img" aria-label={slot.alt} data-media-slot={slot.base}>
        <ArchipelagoSvg className={s.fallbackMap} />
      </div>
    );
  }
  const srcSet = slot.widths.map((w) => `${slot.base}-${w}.webp ${w}w`).join(", ");
  const largest = slot.widths[slot.widths.length - 1];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`${s.img} ${className ?? ""}`}
      src={`${slot.base}-${largest}.webp`}
      srcSet={srcSet}
      sizes={sizes}
      alt={slot.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  );
}
