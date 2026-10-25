// Builds the equirectangular land mask used to texture the 3D globe.
// Source: world-atlas (Natural Earth 1:50m land). Rasterised in headless Chromium,
// so it needs Playwright available (dev only): `NODE_PATH=$(npm root -g) node scripts/build-globe.mjs`.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const W = 2048, H = 1024;

const land = feature(JSON.parse(fs.readFileSync(path.join(root, "node_modules/world-atlas/land-50m.json"), "utf8")), "land");
const proj = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]).precision(0.1);
const d = geoPath(proj).digits(1)(land);

const browser = await chromium.launch();
const page = await browser.newPage();
const dataUrl = await page.evaluate(({ d, W, H }) => {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#fff"; g.fill(new Path2D(d));
  return c.toDataURL("image/png");
}, { d, W, H });
await browser.close();
const out = path.join(root, "public/geo/land-mask.png");
fs.writeFileSync(out, Buffer.from(dataUrl.split(",")[1], "base64"));
console.log("wrote", out, (fs.statSync(out).size / 1024).toFixed(0), "KB");
