// Rates and ranges used by the PEZA incentive calculator.
// Only values confirmed by more than one summary of RA 11534 / RA 12066 are hard-coded.
// Anything that depends on the specific registration (ITH length, SCIT/EDR length) is an
// input the user sets, never a value we assume.

export const rules = {
  /** Regular corporate income tax (RA 11534) */
  regularCit: 0.25,
  /** Domestic corporations with net taxable income ≤ ₱5M and total assets ≤ ₱100M (excluding land) */
  smallCorpCit: 0.2,
  /** Special corporate income tax on gross income earned, in lieu of national and local taxes (3% national, 2% LGU) */
  scit: 0.05,
  /** Corporate income tax for enterprises under the Enhanced Deduction Regime (RA 12066) */
  edrCit: 0.2,
  /** Ceiling of the RBE local tax an LGU may impose during ITH or EDR (RA 12066) */
  rbeltMax: 0.02,
  ith: { min: 4, max: 7 },
  /** Post-ITH SCIT/EDR periods reported across summaries; the actual figure is set at registration */
  post: { min: 1, max: 20, default: 10 },
} as const;

export const ruleNotes = [
  {
    text: "Income tax holiday (ITH) runs 4 to 7 years depending on the project's tier and location. Additional years can apply to projects that relocate entirely out of Metro Manila or locate in areas recovering from conflict or disaster.",
    sources: ["ra11534", "createMoreReform"] as const,
  },
  {
    text: "After the ITH, export enterprises may elect the 5% special corporate income tax (SCIT) on gross income earned, or the Enhanced Deduction Regime (EDR). Domestic market enterprises use the EDR; SCIT is not available to them.",
    sources: ["ra12066", "createMoreReform"] as const,
  },
  {
    text: "The 5% SCIT is in lieu of all national and local taxes: 3% goes to the national government and 2% to the local government unit.",
    sources: ["rbelt", "ra12066"] as const,
  },
  {
    text: "Enterprises under the EDR pay a 20% corporate income tax rate, down from the 25% regular rate, and claim additional deductions now governed by DOF Department Order No. 026-2026.",
    sources: ["createMoreIncentives", "edrOrder"] as const,
  },
  {
    text: "During the ITH and EDR, the local government may impose an RBE local tax of not more than 2% of gross income in place of other local taxes and fees. It does not apply under SCIT.",
    sources: ["rbelt", "createMoreIncentives"] as const,
  },
  {
    text: "How long SCIT or EDR lasts after the ITH depends on the registration: summaries report 10 years for some IPA-registered projects and up to 20 years for FIRB-approved export projects.",
    sources: ["createMoreReform", "ra12066"] as const,
  },
];

export const disclaimer =
  "Estimates are for preliminary planning purposes only and are not an official PEZA determination, tax advice, or a guarantee of eligibility. Actual incentives depend on applicable laws, regulations, project registration, and official approval. Please consult a qualified professional and the relevant government authority.";
