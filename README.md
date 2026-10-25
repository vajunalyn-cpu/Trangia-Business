# Trangia Business — website

Marketing and lead-generation site for **Trangia Business Consultancy Inc.**: an investment gateway to the
Philippines with an interactive 3D archipelago, a region explorer drawn from PSA boundaries, PEZA and BOI
pages, a transparent PEZA incentive calculator and an inquiry form.

- **Stack:** Next.js 16 (App Router, static export), React 19, TypeScript, Three.js, CSS Modules
- **Output:** plain static files in `out/`, deployable to Vercel or any static host
- **Brand:** Manrope + Inter; White `#FFFFFF`, Ivory `#F7F3EB`, 24K Gold `#D4AF37`, Champagne `#E8D5A8`, Deep Navy `#162A4D`

## Run it

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build      # static site in out/
npm run typecheck
```

Node 20 or newer.

## Project structure

```
src/
  app/                    Pages: /, /peza, /boi, /services, /why-philippines, /inquire, /privacy
  components/
    gateway/              3D hero (Three.js scene + React wrapper with static fallback)
    calculator/           PEZA incentive calculator UI and chart
    RegionExplorer.tsx    Interactive 18-region map
    InquiryForm.tsx       Lead form (validation, spam protection, consent)
  config/
    brand.ts              Colours, logo paths, replaceable media slots, hero video
    site.ts               Navigation, site URL, contact details (empty until confirmed)
  content/
    incentives.ts         Rates and rules the calculator uses, with sources
    sources.ts            Every cited source, with the date it was checked
    services.ts           Service descriptions (drafts to confirm)
    regions.ts            Region data + Trangia focus areas (to confirm)
  lib/calc.ts             Pure calculator engine (no UI), easy to test
  data/*.generated.json   Built by scripts/build-geo.mjs — don't edit by hand
public/
  brand/                  Logo files
  media/reference/        Client-supplied renders used on the site
  media/flora/            FLORA images go here (see docs/FLORA-ASSETS.md)
  geo/gateway.json        3D scene geometry
scripts/
  build-geo.mjs           Rebuilds map data from PSA boundaries (`npm run geo`)
  optimize-media.py       Converts a downloaded image into the WebP sizes a media slot needs
docs/                     Deployment, FLORA assets, content checklist
```

## Replacing assets

| What | Where | How |
|---|---|---|
| Logo | `public/brand/` | The current files are crops from the supplied brand renders. Drop in the official master files with the same names, or change the paths in `src/config/brand.ts`. |
| FLORA images | `public/media/flora/` | Run `python3 scripts/optimize-media.py <file> public/media/flora/<slot>` then set `available: true` for that slot in `src/config/brand.ts`. Until then a navy-and-gold panel shows instead. |
| Background film | `src/config/brand.ts` → `ambientVideo` | Optional muted loop behind the closing call-to-action band. The hero stays the interactive 3D scene. See `docs/FLORA-ASSETS.md`. |
| Contact details | `src/config/site.ts` → `contact` | Empty on purpose: nothing invented is published. Filled values appear in the footer automatically. |

## Inquiry form

The site is static, so submissions go to an external endpoint. Set `NEXT_PUBLIC_INQUIRY_ENDPOINT` to any URL that
accepts a JSON `POST` (Formspree, Basin, Web3Forms, a HubSpot/Zoho webhook, Make or Zapier). Fields sent:

```
name, email, company, country, interest, topic, amount, region, message, consent, source, page
```

Without the variable the form validates normally and then tells the visitor it isn't connected yet. Spam
protection: a hidden honeypot field and a minimum fill time; add the provider's own spam filtering or captcha
for production.

## Accuracy

- Map boundaries, region areas and province lists come from PSA's PSGC 3Q 2026 release
  ([faeldon/philippines-json-maps](https://github.com/faeldon/philippines-json-maps)) and include the Negros
  Island Region (18 regions).
- Distances are calculated great-circle distances from Manila.
- Incentive rules were researched on 25 Oct 2026. The PEZA, BOI and Official Gazette sites weren't reachable
  from the build environment, so several facts rest on law-firm and news summaries. These are labelled
  "(summary)" on the page. **Check `docs/CONTENT-TO-CONFIRM.md` before launch.**
- The calculator hard-codes only rates that several sources agree on. The ITH length and the SCIT/EDR period
  are user inputs, because they depend on the registration.

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
