# Content to confirm before launch

Everything below is either a placeholder, a draft, or a fact that rests on a secondary summary.

## Trangia's own information

- [ ] **Contact details** (`src/config/site.ts`): email, phone, office address. Empty until provided.
- [ ] **Services** (`src/content/services.ts`): titles come from the reception signage (Accounting, Taxation,
      Licensing & Registration, Audit & Assurance, Advisory) and the investment materials (PEZA/BOI assistance).
      The descriptions and "includes" lists are drafts. Confirm scope, and that Trangia (or its partners) can
      provide each one, e.g. audit services require an accredited CPA firm.
- [ ] **Trangia focus areas by region** (`src/content/regions.ts`): taken from the "Regional highlights"
      panel in the supplied investment infographic. Confirm or edit.
- [ ] **Privacy notice** (`src/app/privacy/page.tsx`): draft. Add the Data Protection Officer's contact
      details and have it reviewed.
- [ ] **Logo files**: replace the raster crops in `public/brand/` with official masters.
- [ ] **Production domain**: set `NEXT_PUBLIC_SITE_URL`.

## Facts resting on secondary summaries

The official PEZA, BOI and Official Gazette sites were blocked from the build environment on 25 Oct 2026.
Please verify these against the primary text:

| Claim | Where | Source used |
|---|---|---|
| SCIT 5% split 3% national / 2% LGU; RBE local tax up to 2% under ITH/EDR | Calculator, PEZA page | MTF Counsel; PwC |
| EDR income tax rate 20% | Calculator, PEZA page | Grant Thornton; PwC |
| Post-ITH SCIT/EDR period (10 years for some IPA projects, up to 20 for FIRB export projects) | Calculator hint | BusinessMirror; PwC |
| Additional ITH years for relocation from NCR / conflict and disaster areas | Calculator assumptions | Senate copy of RA 11534; BusinessMirror |
| Duty and VAT relief for registered export enterprises | PEZA page | Senate copy of RA 11534 |
| 2026 SIPP tiers and 17 June 2026 effectivity (MO 47-2026) | BOI page | Divina Law |
| 436 PEZA economic zones as of Dec 2025, and the breakdown by type | Home, PEZA, Why PH | House Bill 7815 document |
| PEZA-operated public zones: Baguio City, Cavite, Mactan, Pampanga | PEZA page, region map | Wikipedia (citing PEZA); news reports |
| Green Lane: EO 18 (2023), 203 projects as of April 2025 | BOI page | Daily Tribune |

Confirmed from primary or statistical sources:

- 18 regions, boundaries, land areas, provinces: PSA PSGC 3Q 2026
- Population 112,729,484 (2024 census, Proclamation No. 973, s. 2025): PSA
- Regular CIT 25%, 20% for small corporations: RA 11534 (Senate copy)
- Distances from Manila: calculated

## Calculator scope (by design)

- Income taxes only; no duties, VAT, or local business taxes besides the optional 2% RBE local tax.
- Enhanced deductions are not modelled (only the 20% rate), so EDR results are conservative.
- No loss carry-over.
