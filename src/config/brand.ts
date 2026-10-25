// Single source of truth for brand tokens and replaceable media.
// Swap a file in /public and update its path here; nothing else needs to change.

export const colors = {
  white: "#FFFFFF",
  ivory: "#F7F3EB",
  gold: "#D4AF37", // 24K Gold
  champagne: "#E8D5A8",
  navy: "#162A4D", // Deep Navy Blue
} as const;

export const logo = {
  // Raster crops taken from Trangia's supplied brand renders. Replace with the official
  // vector/PNG master files when available (keep the same paths or update them here).
  onDark: { src: "/brand/trangia-logo-horizontal-on-dark-96.png", width: 243, height: 96 },
  onLight: { src: "/brand/trangia-logo-stacked-on-light-360.png", width: 360, height: 296 },
  emblem: "/brand/trangia-emblem-512.png",
} as const;

export type MediaSlot = {
  /** Path under /public, without width suffix or extension: `${base}-${w}.webp` */
  base: string;
  widths: number[];
  alt: string;
  /** false until the file is placed in /public — a designed fallback renders instead */
  available: boolean;
  /** Where the asset comes from, shown in docs only */
  origin: string;
};

export const media = {
  receptionRender: {
    base: "/media/reference/trangia-reception",
    widths: [800, 1600],
    alt: "Rendering of the Trangia Business Consultancy reception, with service panels for accounting, taxation, licensing and registration, audit and assurance, and advisory",
    available: true,
    origin: "Client-supplied reference render",
  },
  globeRender: {
    base: "/media/reference/trangia-globe",
    widths: [800, 1600],
    alt: "Trangia Business emblem on a navy and gold globe",
    available: true,
    origin: "Client-supplied reference render",
  },
  pezaEcozone: {
    base: "/media/flora/peza-ecozone",
    widths: [960, 1920],
    alt: "Illustrative aerial view of an industrial economic zone at golden hour (AI-generated image, not a specific PEZA zone)",
    available: false,
    origin: "FLORA run run_m1733hsbtp3szfbjvy2t05gqdh8gye7s",
  },
  boiRenewables: {
    base: "/media/flora/boi-renewables",
    widths: [960, 1920],
    alt: "Illustrative wind turbines and solar array on a coastal ridge at dusk (AI-generated image)",
    available: false,
    origin: "FLORA run run_m17dmy82rj3e3nhg16wpkxkf418gz14w",
  },
  manilaSkyline: {
    base: "/media/flora/manila-cbd",
    widths: [960, 1920],
    alt: "Illustrative Metro Manila business district at blue hour (AI-generated image)",
    available: false,
    origin: "FLORA run run_m179dz1vby5wyj95j3g01y8hr58gyzf4",
  },
} satisfies Record<string, MediaSlot>;

/**
 * Optional film behind the closing call-to-action band (e.g. a FLORA image-to-video clip).
 * Leave mp4 empty to show the still render. Muted, looped, and skipped for reduced motion.
 */
export const ambientVideo = {
  mp4: "",
  webm: "",
  poster: "/media/reference/trangia-globe-1600.webp",
};
