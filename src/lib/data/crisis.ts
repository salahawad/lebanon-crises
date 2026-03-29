/**
 * Lebanon war crisis key figures — sourced from LRP March 2026
 * Flash Update #10 (19 March 2026) & Flash Appeal (13 March 2026)
 *
 * These are updated manually when new LRP reports are published.
 * Last updated: 2026-03-29
 */

export interface CrisisKeyFigure {
  id: string;
  value: number;
  labelKey: string;
  icon: "skull" | "ambulance" | "users" | "dollar" | "target";
  color: "danger" | "warning" | "primary" | "success" | "accent";
  sourceDate: string;
}

export const CRISIS_KEY_FIGURES: CrisisKeyFigure[] = [
  {
    id: "killed",
    value: 1000,
    labelKey: "killed",
    icon: "skull",
    color: "danger",
    sourceDate: "2026-03-19",
  },
  {
    id: "injured",
    value: 2584,
    labelKey: "injured",
    icon: "ambulance",
    color: "warning",
    sourceDate: "2026-03-19",
  },
  {
    id: "displaced",
    value: 1200000,
    labelKey: "displaced",
    icon: "users",
    color: "primary",
    sourceDate: "2026-03-19",
  },
  {
    id: "appeal",
    value: 308300000,
    labelKey: "flashAppeal",
    icon: "dollar",
    color: "success",
    sourceDate: "2026-03-13",
  },
  {
    id: "targeted",
    value: 1000000,
    labelKey: "targeted",
    icon: "target",
    color: "accent",
    sourceDate: "2026-03-13",
  },
];

export interface DisplacementZone {
  id: string;
  nameKey: string;
  status: "active_orders" | "heavy_displacement" | "receiving";
}

export const DISPLACEMENT_ZONES: DisplacementZone[] = [
  { id: "south", nameKey: "southLebanon", status: "active_orders" },
  { id: "beirut", nameKey: "partsBeirut", status: "active_orders" },
  { id: "bekaa", nameKey: "bekaaValley", status: "heavy_displacement" },
  { id: "border", nameKey: "borderVillages", status: "active_orders" },
  { id: "mount_lebanon", nameKey: "mountLebanon", status: "receiving" },
  { id: "north", nameKey: "northLebanon", status: "receiving" },
];

export interface EmergencyResource {
  id: string;
  titleKey: string;
  descKey: string;
  icon: "clipboard" | "school" | "shield" | "accessibility" | "baby" | "bomb";
  bilingual: boolean;
  url: string;
}

export const EMERGENCY_RESOURCES: EmergencyResource[] = [
  {
    id: "mosa_registration",
    titleKey: "mosaTitle",
    descKey: "mosaDesc",
    icon: "clipboard",
    bilingual: false,
    url: "https://survey123.arcgis.com/share/79d1de7ea9a347e8a08e5b498e27a352",
  },
  {
    id: "mehe_shelters",
    titleKey: "meheTitle",
    descKey: "meheDesc",
    icon: "school",
    bilingual: false,
    url: "https://www.mehe.gov.lb/en/Pages/Shelters.aspx",
  },
  {
    id: "psea_guidance",
    titleKey: "pseaTitle",
    descKey: "pseaDesc",
    icon: "shield",
    bilingual: true,
    url: "https://psea.interagencystandingcommittee.org/resources/lebanon",
  },
  {
    id: "disability_orgs",
    titleKey: "disabilityTitle",
    descKey: "disabilityDesc",
    icon: "accessibility",
    bilingual: true,
    url: "https://reliefweb.int/report/lebanon/disability-emergency-assistance-directory-lebanon",
  },
  {
    id: "formula_milk",
    titleKey: "formulaTitle",
    descKey: "formulaDesc",
    icon: "baby",
    bilingual: true,
    url: "https://www.unicef.org/lebanon/formula-milk-provision-guidance",
  },
  {
    id: "eore_lmac",
    titleKey: "eoreTitle",
    descKey: "eoreDesc",
    icon: "bomb",
    bilingual: false,
    url: "https://www.leblac.org",
  },
];

export interface SectorSitrep {
  id: string;
  titleKey: string;
  org: string;
  date: string;
  sector: "health" | "food" | "protection" | "wash" | "education" | "general";
  url: string;
}

export const SECTOR_SITREPS: SectorSitrep[] = [
  {
    id: "who_health",
    titleKey: "whoHealth",
    org: "WHO",
    date: "2026-03-20",
    sector: "health",
    url: "https://www.emro.who.int/lebanon/information-resources/lebanon-crisis.html",
  },
  {
    id: "food_security",
    titleKey: "foodSecurity",
    org: "FAO/WFP",
    date: "2026-03-19",
    sector: "food",
    url: "https://www.wfp.org/emergencies/lebanon-emergency",
  },
  {
    id: "protection",
    titleKey: "protection",
    org: "UNHCR",
    date: "2026-03-16",
    sector: "protection",
    url: "https://www.unhcr.org/lb/",
  },
  {
    id: "wash",
    titleKey: "wash",
    org: "UNICEF",
    date: "2026-03-23",
    sector: "wash",
    url: "https://www.unicef.org/lebanon/water-sanitation-and-hygiene",
  },
  {
    id: "unicef_flash",
    titleKey: "unicefFlash",
    org: "UNICEF",
    date: "2026-03-12",
    sector: "general",
    url: "https://www.unicef.org/lebanon/emergencies",
  },
  {
    id: "unrwa",
    titleKey: "unrwa",
    org: "UNRWA",
    date: "2026-03-18",
    sector: "general",
    url: "https://www.unrwa.org/where-we-work/lebanon",
  },
];
