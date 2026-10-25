// Every factual claim on the site points at one of these entries.
// `checked` is the date the claim was last reviewed. The official PEZA, BOI and Official
// Gazette sites could not be reached from the build environment on that date, so several
// claims rest on professional-firm and news summaries; they are marked `secondary: true`
// and must be confirmed against the primary source before launch.

export type Source = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  checked: string;
  secondary?: boolean;
};

const CHECKED = "25 Oct 2026";

export const sources = {
  ra12066: {
    id: "ra12066",
    title: "CREATE MORE Act (Republic Act No. 12066) — tax alert summary",
    publisher: "PwC Philippines",
    url: "https://www.pwc.com/ph/en/tax/tax-alerts/2024/pwcph-tax-alert-44-create-more.pdf",
    checked: CHECKED,
    secondary: true,
  },
  createMoreIncentives: {
    id: "createMoreIncentives",
    title: "Incentives of registered business enterprises under the CREATE MORE Act",
    publisher: "Grant Thornton Philippines",
    url: "https://www.grantthornton.com.ph/insights/articles-and-updates1/tax-notes/incentives-of-registered-business-enterprises-rbes-under-the-create-more-act/",
    checked: CHECKED,
    secondary: true,
  },
  createMoreReform: {
    id: "createMoreReform",
    title: "Reformed tax incentives under CREATE MORE",
    publisher: "BusinessMirror",
    url: "https://businessmirror.com.ph/2024/11/26/reformed-tax-incentives-under-create-more/",
    checked: CHECKED,
    secondary: true,
  },
  rbelt: {
    id: "rbelt",
    title: "Explaining the 2% local tax on business enterprises",
    publisher: "MTF Counsel",
    url: "https://mtfcounsel.com/2025/08/07/explaining-the-2-local-tax-on-business-enterprises/",
    checked: CHECKED,
    secondary: true,
  },
  ra11534: {
    id: "ra11534",
    title: "Republic Act No. 11534 (CREATE Act)",
    publisher: "Senate of the Philippines",
    url: "https://legacy.senate.gov.ph/republic_acts/ra%2011534.pdf",
    checked: CHECKED,
  },
  edrOrder: {
    id: "edrOrder",
    title: "DOF Department Order No. 026-2026 on the Enhanced Deduction Regime",
    publisher: "Grant Thornton Philippines",
    url: "https://www.grantthornton.com.ph/technical-alerts/tax-alert/2026/circularizing-department-of-finance-dof-order-no-026-2026-on-the-terms-and-conditions-on-the-grant-of-the-enhanced-deduction-regime/",
    checked: CHECKED,
    secondary: true,
  },
  sipp2026: {
    id: "sipp2026",
    title: "BOI Memorandum Order No. 47-2026 (2026 Strategic Investment Priority Plan)",
    publisher: "Divina Law",
    url: "https://www.divinalaw.com/wp-content/uploads/2026/08/BOI-01-Memorandum-Order-No.-47-2026.pdf",
    checked: CHECKED,
    secondary: true,
  },
  greenLane: {
    id: "greenLane",
    title: "BOI lists 203 projects to Green Lane",
    publisher: "Daily Tribune",
    url: "https://tribune.net.ph/2025/04/30/boi-lists-203-projects-to-green-lane",
    checked: CHECKED,
    secondary: true,
  },
  pezaZones: {
    id: "pezaZones",
    title: "House Bill 7815 explanatory note (PEZA economic zone count as of Dec 2025)",
    publisher: "House of Representatives",
    url: "https://docs.congress.hrep.online/legisdocs/basic_20/HB07815.pdf",
    checked: CHECKED,
    secondary: true,
  },
  pezaPublicZones: {
    id: "pezaPublicZones",
    title: "Philippine Economic Zone Authority — public economic zones",
    publisher: "Wikipedia (citing PEZA)",
    url: "https://en.wikipedia.org/wiki/Philippine_Economic_Zone_Authority",
    checked: CHECKED,
    secondary: true,
  },
  popcen: {
    id: "popcen",
    title: "2024 Census of Population (Proclamation No. 973, s. 2025)",
    publisher: "Philippine Statistics Authority",
    url: "https://rsso04a.psa.gov.ph/infographics/2024-census-population-popcen",
    checked: CHECKED,
  },
  psgc: {
    id: "psgc",
    title: "Philippine Standard Geographic Code boundaries, 3Q 2026",
    publisher: "PSA, via faeldon/philippines-json-maps",
    url: "https://github.com/faeldon/philippines-json-maps",
    checked: CHECKED,
  },
  peza: {
    id: "peza",
    title: "Philippine Economic Zone Authority",
    publisher: "PEZA",
    url: "https://www.peza.gov.ph/",
    checked: CHECKED,
  },
  boi: {
    id: "boi",
    title: "Board of Investments",
    publisher: "BOI",
    url: "https://boi.gov.ph/",
    checked: CHECKED,
  },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof sources;
