// Services are taken from Trangia's reception signage (Accounting, Taxation, Licensing &
// Registration, Audit & Assurance, Advisory) and investment materials (PEZA/BOI assistance).
// Descriptions are drafts — CONFIRM scope and wording with Trangia before launch.

export type Service = {
  id: string;
  title: string;
  summary: string;
  includes: string[];
  stage: string;
};

export const services: Service[] = [
  {
    id: "registration",
    title: "Business registration and licensing",
    stage: "Set up",
    summary:
      "Form the right entity and get it licensed to operate, with the filings sequenced so nothing waits on something else.",
    includes: [
      "Entity selection and SEC or DTI registration",
      "Local business permits",
      "BIR registration and books of accounts",
      "Social agency registrations for employers",
    ],
  },
  {
    id: "investment",
    title: "PEZA and BOI registration assistance",
    stage: "Register incentives",
    summary:
      "Prepare and file the application that matches your activity and location, and keep the registration in good standing afterwards.",
    includes: [
      "Choosing between PEZA, BOI or another agency",
      "Project profile and application preparation",
      "Coordination with the investment promotion agency",
      "Post-registration reporting",
    ],
  },
  {
    id: "taxation",
    title: "Taxation and compliance",
    stage: "Stay compliant",
    summary:
      "File on time and claim the incentives you registered for, whether the project is under ITH, SCIT or the enhanced deductions.",
    includes: ["Monthly, quarterly and annual returns", "Incentive availment and documentation", "Tax planning", "Assessment support"],
  },
  {
    id: "accounting",
    title: "Accounting",
    stage: "Run the books",
    summary: "Keep accurate books in a format that satisfies Philippine reporting requirements and your head office.",
    includes: ["Bookkeeping", "Payroll", "Management reporting", "Financial statement preparation"],
  },
  {
    id: "audit",
    title: "Audit and assurance",
    stage: "Report",
    summary: "Give regulators, investors and lenders confidence in the numbers.",
    includes: ["Financial statement audit coordination", "Internal control reviews", "Agreed-upon procedures"],
  },
  {
    id: "advisory",
    title: "Business advisory",
    stage: "Grow",
    summary: "Plan the next site, entity or restructuring with the regulatory and tax effects worked out in advance.",
    includes: ["Market entry planning", "Corporate structuring", "Expansion and relocation", "Due diligence support"],
  },
];
