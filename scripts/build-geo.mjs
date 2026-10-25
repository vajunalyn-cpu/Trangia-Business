// Builds the geographic data the site renders from.
// Source: faeldon/philippines-json-maps (PSGC 3Q 2026, PSA boundaries) and
// world-atlas (Natural Earth 1:50m land). Run with `npm run geo`.
import fs from "node:fs";
import path from "node:path";
import { geoMercator, geoContains, geoCentroid, geoDistance } from "d3-geo";
import { feature } from "topojson-client";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = (f) => path.join(root, "scripts/source", f);
const readJSON = (f) => JSON.parse(fs.readFileSync(f, "utf8"));

// The source follows RFC 7946 (counter-clockwise exteriors); d3-geo expects the
// opposite on the sphere, so rewind every ring before using it.
const signedArea = (ring) => {
  let s = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return s / 2;
};
const rewindPolygon = (poly) =>
  poly.map((ring, i) => {
    const ccw = signedArea(ring) > 0;
    const wantCw = i === 0;
    return ccw === wantCw ? ring.slice().reverse() : ring;
  });
const rewind = (fc) => {
  for (const f of fc.features) {
    const g = f.geometry;
    if (g.type === "Polygon") g.coordinates = rewindPolygon(g.coordinates);
    else g.coordinates = g.coordinates.map(rewindPolygon);
  }
  return fc;
};

const country = rewind(readJSON(src("regions-low.json")));

// Short codes and display names. Names follow PSA's official region names.
const META = {
  100000000: { code: "I", name: "Ilocos Region", group: "Luzon" },
  200000000: { code: "II", name: "Cagayan Valley", group: "Luzon" },
  300000000: { code: "III", name: "Central Luzon", group: "Luzon" },
  400000000: { code: "IV-A", name: "CALABARZON", group: "Luzon" },
  500000000: { code: "V", name: "Bicol Region", group: "Luzon" },
  600000000: { code: "VI", name: "Western Visayas", group: "Visayas" },
  700000000: { code: "VII", name: "Central Visayas", group: "Visayas" },
  800000000: { code: "VIII", name: "Eastern Visayas", group: "Visayas" },
  900000000: { code: "IX", name: "Zamboanga Peninsula", group: "Mindanao" },
  1000000000: { code: "X", name: "Northern Mindanao", group: "Mindanao" },
  1100000000: { code: "XI", name: "Davao Region", group: "Mindanao" },
  1200000000: { code: "XII", name: "SOCCSKSARGEN", group: "Mindanao" },
  1300000000: { code: "NCR", name: "National Capital Region", group: "Luzon" },
  1400000000: { code: "CAR", name: "Cordillera Administrative Region", group: "Luzon" },
  1600000000: { code: "XIII", name: "Caraga", group: "Mindanao" },
  1700000000: { code: "MIMAROPA", name: "MIMAROPA Region", group: "Luzon" },
  1800000000: { code: "NIR", name: "Negros Island Region", group: "Visayas" },
  1900000000: { code: "BARMM", name: "Bangsamoro Autonomous Region in Muslim Mindanao", group: "Mindanao" },
};

const cleanProvince = (n) =>
  n
    .replace(/^NCR, /, "")
    .replace(/ \(Not a Province\)$/, "")
    .replace("City of Manila, First District", "First District (City of Manila)");

// ---------- 2D region map (SVG) ----------
const W = 800, H = 1200, PAD = 24;
const proj2d = geoMercator().fitExtent([[PAD, PAD], [W - PAD, H - PAD]], country);
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

// Project rings and drop points closer than MIN_PX to the previous one.
const MIN_PX = 0.9;
const polygonsOf = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);
const svgPath = (g) => {
  let d = "";
  for (const poly of polygonsOf(g)) {
    for (const ring of poly) {
      const pts = [];
      for (const c of ring) {
        const [x, y] = proj2d(c);
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(x - last[0], y - last[1]) >= MIN_PX) pts.push([x, y]);
      }
      if (pts.length < 3) continue;
      d += "M" + pts.map(([x, y]) => `${round(x)},${round(y)}`).join("L") + "Z";
    }
  }
  return d;
};

const regions = country.features
  .map((f) => {
    const psgc = f.properties.adm1_psgc;
    const meta = META[psgc];
    if (!meta) throw new Error(`Unknown region ${psgc}`);
    const prov = readJSON(src(`prov-${psgc}.json`));
    const [cx, cy] = proj2d(geoCentroid(f));
    return {
      psgc,
      code: meta.code,
      name: meta.name,
      group: meta.group,
      areaKm2: f.properties.area_km2,
      provinces: prov.features.map((p) => cleanProvince(p.properties.adm2_en)),
      d: svgPath(f.geometry),
      cx: round(cx),
      cy: round(cy),
    };
  })
  .sort((a, b) => a.psgc - b.psgc);

// Places shown as markers. Coordinates are city/municipality centres, not zone boundaries.
const PEZA_PUBLIC_ZONES = [
  { name: "Baguio City Economic Zone", place: "Baguio City", region: "CAR", lon: 120.596, lat: 16.402 },
  { name: "Pampanga Economic Zone", place: "Angeles City, Pampanga", region: "III", lon: 120.589, lat: 15.145 },
  { name: "Cavite Economic Zone", place: "Rosario, Cavite", region: "IV-A", lon: 120.855, lat: 14.417 },
  { name: "Mactan Economic Zone", place: "Lapu-Lapu City, Cebu", region: "VII", lon: 123.959, lat: 10.311 },
];
const zones = PEZA_PUBLIC_ZONES.map((z) => {
  const [x, y] = proj2d([z.lon, z.lat]);
  return { ...z, x: round(x), y: round(y) };
});

const MANILA = [120.9842, 14.5995];
const HUBS = [
  { name: "Tokyo", lon: 139.6503, lat: 35.6762 },
  { name: "Seoul", lon: 126.978, lat: 37.5665 },
  { name: "Shanghai", lon: 121.4737, lat: 31.2304 },
  { name: "Taipei", lon: 121.5654, lat: 25.033 },
  { name: "Hong Kong", lon: 114.1694, lat: 22.3193 },
  { name: "Bangkok", lon: 100.5018, lat: 13.7563 },
  { name: "Ho Chi Minh City", lon: 106.6297, lat: 10.8231 },
  { name: "Kuala Lumpur", lon: 101.6869, lat: 3.139 },
  { name: "Singapore", lon: 103.8198, lat: 1.3521 },
  { name: "Jakarta", lon: 106.8456, lat: -6.2088 },
];
const FAR_HUBS = [
  { name: "Sydney", lon: 151.2093, lat: -33.8688 },
  { name: "Dubai", lon: 55.2708, lat: 25.2048 },
  { name: "Los Angeles", lon: -118.2437, lat: 34.0522 },
  { name: "London", lon: -0.1276, lat: 51.5072 },
];
const EARTH_KM = 6371.0088;
const km = (p) => Math.round((geoDistance(MANILA, [p.lon, p.lat]) * EARTH_KM) / 10) * 10;

const distances = [...HUBS, ...FAR_HUBS].map((h) => ({ name: h.name, km: km(h) })).sort((a, b) => a.km - b.km);

fs.mkdirSync(path.join(root, "src/data"), { recursive: true });
fs.writeFileSync(
  path.join(root, "src/data/regions.generated.json"),
  JSON.stringify({ viewBox: `0 0 ${W} ${H}`, source: "PSA PSGC 3Q 2026 via faeldon/philippines-json-maps", regions, zones })
);
fs.writeFileSync(
  path.join(root, "src/data/distances.generated.json"),
  JSON.stringify({ from: "Manila", method: "Great-circle distance, rounded to 10 km", distances })
);

// ---------- 3D gateway scene ----------
// Local equirectangular plane centred on the archipelago; 1 unit = 1 degree of latitude.
const LON0 = 122, LAT0 = 12.5, K = Math.cos((LAT0 * Math.PI) / 180);
const plane = ([lon, lat]) => [round((lon - LON0) * K, 3), round(lat - LAT0, 3)];

const shapes = [];
for (const f of country.features) {
  const g = f.geometry;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  for (const poly of polys) {
    const rings = poly.map((ring) => ring.map(plane));
    // Skip specks under ~3 vertices after simplification.
    if (rings[0].length < 4) continue;
    shapes.push({ r: META[f.properties.adm1_psgc].code, rings });
  }
}

const land = feature(readJSON(path.join(root, "node_modules/world-atlas/land-50m.json")), "land");
const dots = [];
const STEP = 0.42;
for (let lat = -11; lat <= 42; lat += STEP) {
  // Offset alternate rows for a hexagonal dot field.
  const off = Math.round((lat + 11) / STEP) % 2 ? STEP / 2 : 0;
  for (let lon = 96 + off; lon <= 152; lon += STEP) {
    if (!geoContains(land, [lon, lat])) continue;
    if (country.features.some((f) => geoContains(f, [lon, lat]))) continue;
    dots.push(...plane([lon, lat]));
  }
}

const gateway = {
  origin: { name: "Manila", p: plane(MANILA) },
  hubs: HUBS.map((h) => ({ name: h.name, p: plane([h.lon, h.lat]), km: km(h) })),
  zones: PEZA_PUBLIC_ZONES.map((z) => ({ name: z.name, p: plane([z.lon, z.lat]) })),
  shapes,
  dots,
};
fs.mkdirSync(path.join(root, "public/geo"), { recursive: true });
fs.writeFileSync(path.join(root, "public/geo/gateway.json"), JSON.stringify(gateway));

const size = (f) => (fs.statSync(path.join(root, f)).size / 1024).toFixed(0) + " KB";
console.log("regions", regions.length, size("src/data/regions.generated.json"));
console.log("gateway shapes", shapes.length, "dots", dots.length / 2, size("public/geo/gateway.json"));
console.log(distances);
