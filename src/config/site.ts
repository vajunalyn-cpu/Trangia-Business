export const site = {
  name: "Trangia Business Consultancy Inc.",
  shortName: "Trangia Business",
  tagline: "Empower Business Success!",
  // Set NEXT_PUBLIC_SITE_URL in Vercel once the production domain is known.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://trangia-business-website.vercel.app",
  description:
    "Trangia Business Consultancy helps investors set up and grow in the Philippines: PEZA and BOI registration assistance, business registration and licensing, taxation, accounting, audit and advisory.",
  // CONFIRM: fill in real contact details. Left empty so nothing invented is published.
  contact: {
    email: "",
    phone: "",
    address: "",
  },
};

export type NavItem = { label: string; href: string; description?: string; children?: NavItem[] };

export const nav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Foreign Investment",
    href: "/peza/",
    children: [
      {
        label: "PEZA",
        href: "/peza/",
        description: "Register inside an economic zone or IT park, with an incentive calculator",
      },
      {
        label: "BOI",
        href: "/boi/",
        description: "Register a priority project anywhere in the country under the SIPP",
      },
    ],
  },
  { label: "Services", href: "/services/" },
  { label: "Why Philippines", href: "/why-philippines/" },
];
