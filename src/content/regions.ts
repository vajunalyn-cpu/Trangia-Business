import geo from "@/data/regions.generated.json";

export type Region = (typeof geo.regions)[number];
export type Zone = (typeof geo.zones)[number];

export const regions: Region[] = geo.regions;
export const zones: Zone[] = geo.zones;
export const mapViewBox = geo.viewBox;

// Focus areas taken from Trangia's own investment brief ("Regional highlights" panel).
// CONFIRM with Trangia before launch; these are marked on screen as Trangia's focus areas,
// not official designations.
export const trangiaFocus: Record<string, string[]> = {
  NCR: ["Financial and business services", "IT-BPM", "Research and development", "Headquarters and regional operations"],
  "IV-A": ["Manufacturing", "Logistics and warehousing", "Ecozones and industrial parks", "Agro-industrial development"],
  VII: ["Tourism and hospitality", "IT-BPM", "Renewable energy", "Real estate and infrastructure"],
  XI: ["Agro-forestry and agribusiness", "Food processing", "Tourism", "Logistics and trade"],
  XIII: ["Renewable energy", "Mining support industries", "Agro-industrial development", "Eco-tourism"],
};

// Label anchors for regions whose geometric centroid falls at sea.
export const labelOffsets: Record<string, [number, number]> = {
  MIMAROPA: [-120, 70],
  BARMM: [-18, 18],
  NCR: [-46, 0],
};

export const groups = ["Luzon", "Visayas", "Mindanao"] as const;
