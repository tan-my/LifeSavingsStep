import type { CustomEvent } from "./types";

/**
 * A catalog of common life events with an average cost each, so that adding
 * "Wedding" to the timeline starts from a number instead of an empty field.
 *
 * Each `average` is a single representative figure, not a researched price for
 * any individual — real costs swing widely with lifestyle, location and year.
 * Every preset carries a `note` saying what its number covers; the picker
 * copies that note onto the created event so the assumption travels with the
 * number and can be corrected later.
 */

export type PresetGroup =
  | "Relationship & family"
  | "Children & education"
  | "Housing"
  | "Vehicles"
  | "Career & education"
  | "Health & family care"
  | "Faith & festive"
  | "Retirement & later life"
  | "Big purchases"
  | "Money coming in";

export const PRESET_GROUPS: PresetGroup[] = [
  "Relationship & family",
  "Children & education",
  "Housing",
  "Vehicles",
  "Career & education",
  "Health & family care",
  "Faith & festive",
  "Retirement & later life",
  "Big purchases",
  "Money coming in",
];

export interface EventPreset {
  id: string;
  title: string;
  group: PresetGroup;
  /**
   * Average cost in RM — a one-time total, or the per-year amount when
   * `recurring`. Negative means money coming IN (a bonus, a sale, a payout).
   */
  average: number;
  recurring: boolean;
  /** Recurring only: how many years it usually runs. Omitted = to the end of the timeline. */
  defaultYears?: number;
  /** What the figure covers. Copied onto the created event as its note. */
  note: string;
}

export const EVENT_PRESETS: EventPreset[] = [
  // Relationship & family
  {
    id: "engagement-ring",
    title: "Engagement ring",
    group: "Relationship & family",
    average: 3_000,
    recurring: false,
    note: "Ring only, at a modest diamond or gold setting.",
  },
  {
    id: "wedding-full",
    title: "Wedding — full celebration",
    group: "Relationship & family",
    average: 50_000,
    recurring: false,
    note: "Venue, catering, attire and photography for a few hundred guests. Swings hard with guest count and whether it is a hotel ballroom.",
  },
  {
    id: "wedding-small",
    title: "Wedding — registration / small ceremony",
    group: "Relationship & family",
    average: 5_000,
    recurring: false,
    note: "Solemnisation plus a small family gathering, with no large reception.",
  },
  {
    id: "hantaran",
    title: "Hantaran / dowry / betrothal gifts",
    group: "Relationship & family",
    average: 10_000,
    recurring: false,
    note: "Customary gift exchange, usually negotiated between families.",
  },
  {
    id: "honeymoon",
    title: "Honeymoon",
    group: "Relationship & family",
    average: 5_000,
    recurring: false,
    note: "A regional trip. A long-haul honeymoon runs several times this.",
  },

  // Children & education
  {
    id: "delivery-private",
    title: "Pregnancy & delivery — private hospital",
    group: "Children & education",
    average: 8_000,
    recurring: false,
    note: "Antenatal checkups plus delivery at a private hospital. A caesarean pushes this up; maternity insurance pulls it down.",
  },
  {
    id: "delivery-government",
    title: "Pregnancy & delivery — government hospital",
    group: "Children & education",
    average: 500,
    recurring: false,
    note: "Subsidised public healthcare — largely nominal fees plus supplements and incidentals.",
  },
  {
    id: "confinement",
    title: "Confinement care (30 days)",
    group: "Children & education",
    average: 8_000,
    recurring: false,
    note: "A confinement lady or centre for 30 days, plus herbs and meals.",
  },
  {
    id: "newborn-setup",
    title: "Newborn setup (cot, stroller, car seat)",
    group: "Children & education",
    average: 2_500,
    recurring: false,
    note: "One-off gear. Much lower with hand-me-downs or second-hand purchases.",
  },
  {
    id: "baby-essentials",
    title: "Baby essentials (diapers, formula, milk)",
    group: "Children & education",
    average: 3_600,
    recurring: true,
    defaultYears: 3,
    note: "Per year for roughly the first three years. Lower if breastfeeding.",
  },
  {
    id: "childcare",
    title: "Childcare / taska / nanny",
    group: "Children & education",
    average: 7_200,
    recurring: true,
    defaultYears: 4,
    note: "Per year per child until school age, for a taska, nursery or nanny.",
  },
  {
    id: "aqiqah",
    title: "Aqiqah / full-moon celebration",
    group: "Children & education",
    average: 2_000,
    recurring: false,
    note: "Newborn celebration including livestock or catering.",
  },
  {
    id: "kindergarten",
    title: "Kindergarten fees",
    group: "Children & education",
    average: 4_500,
    recurring: true,
    defaultYears: 3,
    note: "Per year per child, roughly ages four to six.",
  },
  {
    id: "school-public",
    title: "School — public (uniforms, books, activities)",
    group: "Children & education",
    average: 1_500,
    recurring: true,
    defaultYears: 11,
    note: "Per year per child. Tuition itself is free; this covers uniforms, books, activities and transport.",
  },
  {
    id: "school-private",
    title: "School — private / international",
    group: "Children & education",
    average: 35_000,
    recurring: true,
    defaultYears: 11,
    note: "Per year per child before uniforms, transport and trips. NOT YET CONFIRMED — this is still a placeholder figure, unlike the rest of the catalog.",
  },
  {
    id: "tuition",
    title: "Tuition classes",
    group: "Children & education",
    average: 3_600,
    recurring: true,
    defaultYears: 6,
    note: "Per year per child, covering two or three subjects.",
  },
  {
    id: "uni-local",
    title: "Child's university — local",
    group: "Children & education",
    average: 40_000,
    recurring: false,
    note: "Whole-degree total at a local university.",
  },
  {
    id: "uni-overseas",
    title: "Child's university — overseas",
    group: "Children & education",
    average: 145_000,
    recurring: false,
    note: "Whole-degree total overseas including living costs. Very sensitive to destination and exchange rate.",
  },

  // Housing
  {
    id: "house-downpayment",
    title: "House down payment (10%)",
    group: "Housing",
    average: 50_000,
    recurring: false,
    note: "Ten per cent of the purchase price, assuming a property around RM500k. Scale this to your own target price.",
  },
  {
    id: "house-legal",
    title: "Legal fees, stamp duty & loan documentation",
    group: "Housing",
    average: 15_000,
    recurring: false,
    note: "Sale agreement, loan agreement and stamp duty — roughly three per cent of the price. Often absorbed by the developer on new units.",
  },
  {
    id: "renovation",
    title: "Home renovation",
    group: "Housing",
    average: 40_000,
    recurring: false,
    note: "Paint, flooring, a kitchen and some built-ins. A full gut including wet works costs several times this.",
  },
  {
    id: "furnishing",
    title: "Furnishing & appliances",
    group: "Housing",
    average: 20_000,
    recurring: false,
    note: "Furniture, white goods, curtains and lighting for a whole home.",
  },
  {
    id: "moving",
    title: "Moving costs",
    group: "Housing",
    average: 1_000,
    recurring: false,
    note: "Movers and transport within the same city. Interstate moves cost more.",
  },
  {
    id: "mortgage",
    title: "Mortgage repayment",
    group: "Housing",
    average: 24_000,
    recurring: true,
    note: "Per year — about RM2,000 a month. Set the end year to match your loan tenure.",
  },
  {
    id: "condo-maintenance",
    title: "Condo maintenance & sinking fund",
    group: "Housing",
    average: 3_600,
    recurring: true,
    note: "Per year — maintenance fee plus sinking fund, around RM300 a month.",
  },
  {
    id: "property-tax",
    title: "Assessment tax & quit rent",
    group: "Housing",
    average: 500,
    recurring: true,
    note: "Per year, both combined. Varies by council and property type.",
  },

  // Vehicles
  {
    id: "car-downpayment",
    title: "Car down payment (10%)",
    group: "Vehicles",
    average: 9_000,
    recurring: false,
    note: "Ten per cent of the on-the-road price, assuming a car around RM90k.",
  },
  {
    id: "car-outright",
    title: "Car purchase — paid outright",
    group: "Vehicles",
    average: 90_000,
    recurring: false,
    note: "A new car bought without financing.",
  },
  {
    id: "car-loan",
    title: "Car loan repayment",
    group: "Vehicles",
    average: 10_800,
    recurring: true,
    defaultYears: 9,
    note: "Per year — about RM900 a month over a nine-year tenure.",
  },
  {
    id: "motorcycle",
    title: "Motorcycle purchase",
    group: "Vehicles",
    average: 6_000,
    recurring: false,
    note: "A basic commuter bike.",
  },
  {
    id: "car-running",
    title: "Car running costs (fuel, tolls, parking)",
    group: "Vehicles",
    average: 6_000,
    recurring: true,
    note: "Per year — about RM500 a month for a daily commute.",
  },
  {
    id: "car-insurance-roadtax",
    title: "Car insurance & road tax",
    group: "Vehicles",
    average: 1_500,
    recurring: true,
    note: "Per year. Falls over time as the car depreciates and the no-claim discount builds up.",
  },
  {
    id: "car-servicing",
    title: "Car servicing, tyres & repairs",
    group: "Vehicles",
    average: 1_500,
    recurring: true,
    note: "Per year averaged — routine servicing plus a set of tyres spread over about four years.",
  },

  // Career & education
  {
    id: "masters-local",
    title: "Master's degree — local",
    group: "Career & education",
    average: 25_000,
    recurring: false,
    note: "Whole-programme total at a local university.",
  },
  {
    id: "masters-overseas",
    title: "Master's degree — overseas",
    group: "Career & education",
    average: 100_000,
    recurring: false,
    note: "Tuition plus living costs over one to two years. Very sensitive to destination and exchange rate.",
  },
  {
    id: "certification",
    title: "Professional certification (ACCA, CFA, PMP)",
    group: "Career & education",
    average: 5_000,
    recurring: false,
    note: "All exam sittings, registration and study materials through to completion.",
  },
  {
    id: "short-course",
    title: "Short course / bootcamp",
    group: "Career & education",
    average: 2_000,
    recurring: false,
    note: "A single intensive programme. Check whether levy funding applies before budgeting the full amount.",
  },
  {
    id: "sabbatical",
    title: "Career break / sabbatical (living costs)",
    group: "Career & education",
    average: 36_000,
    recurring: true,
    defaultYears: 1,
    note: "A year of living costs while not earning. Also shorten or end your income source over the same period so the gap shows on both sides of the projection.",
  },
  {
    id: "start-business",
    title: "Starting a business (capital)",
    group: "Career & education",
    average: 20_000,
    recurring: false,
    note: "Initial capital only — registration, equipment, inventory and the first months of runway.",
  },

  // Health & family care
  {
    id: "supporting-parents",
    title: "Supporting aging parents",
    group: "Health & family care",
    average: 6_000,
    recurring: true,
    note: "Per year — about RM500 a month toward living costs and medical bills.",
  },
  {
    id: "major-medical",
    title: "Major medical procedure (private, uninsured)",
    group: "Health & family care",
    average: 30_000,
    recurring: false,
    note: "Out-of-pocket cost for a procedure at a private hospital. Set this near zero if you carry adequate medical cover.",
  },
  {
    id: "long-term-care",
    title: "Nursing home / long-term care",
    group: "Health & family care",
    average: 36_000,
    recurring: true,
    note: "Per year for full-time residential care, about RM3,000 a month.",
  },
  {
    id: "insurance-premiums",
    title: "Medical & life insurance premiums",
    group: "Health & family care",
    average: 3_600,
    recurring: true,
    note: "Per year — medical and life cover, about RM300 a month. Premiums rise steeply with age, so consider splitting this into age bands.",
  },

  // Faith & festive
  {
    id: "hajj",
    title: "Hajj",
    group: "Faith & festive",
    average: 25_000,
    recurring: false,
    note: "The subsidised package. Private packages cost considerably more.",
  },
  {
    id: "umrah",
    title: "Umrah",
    group: "Faith & festive",
    average: 8_000,
    recurring: false,
    note: "Per person per trip, depending on package tier and season.",
  },
  {
    id: "festive-spending",
    title: "Festive spending (duit raya, angpow, gifts)",
    group: "Faith & festive",
    average: 2_000,
    recurring: true,
    note: "Per year, covering festive giving, open house, new clothes and travel home.",
  },
  {
    id: "zakat-tithe",
    title: "Zakat / tithe / regular giving",
    group: "Faith & festive",
    average: 1_500,
    recurring: true,
    note: "Per year. Zakat on savings is 2.5% of qualifying wealth held for a full year, so recalculate this as your balance grows.",
  },

  // Retirement & later life
  {
    id: "retirement-living",
    title: "Retirement living costs",
    group: "Retirement & later life",
    average: 60_000,
    recurring: true,
    note: "Per year from your retirement year onward. Only use this if your categories do NOT already cover these costs, otherwise you will double-count them.",
  },
  {
    id: "estate-planning",
    title: "Will & estate planning",
    group: "Retirement & later life",
    average: 1_000,
    recurring: false,
    note: "Drafting a will. Setting up a trust costs more.",
  },
  {
    id: "funeral",
    title: "Funeral / final expenses",
    group: "Retirement & later life",
    average: 15_000,
    recurring: false,
    note: "Varies widely by rites and burial arrangements.",
  },

  // Big purchases
  {
    id: "device-refresh",
    title: "Laptop / phone refresh",
    group: "Big purchases",
    average: 3_000,
    recurring: true,
    note: "Per year averaged — a laptop and phone replaced every few years.",
  },
  {
    id: "appliance-replacement",
    title: "Home appliance replacement",
    group: "Big purchases",
    average: 2_500,
    recurring: false,
    note: "Replacing one major appliance — a fridge, washer, air-conditioning unit or water heater.",
  },
  {
    id: "big-holiday",
    title: "Major holiday / long-haul trip",
    group: "Big purchases",
    average: 8_000,
    recurring: false,
    note: "Per trip for two, including flights and accommodation.",
  },
  {
    id: "pet-setup",
    title: "Getting a pet (setup + first year)",
    group: "Big purchases",
    average: 1_500,
    recurring: false,
    note: "Adoption or purchase, vaccinations, neutering and initial gear.",
  },
  {
    id: "pet-ongoing",
    title: "Pet ongoing costs",
    group: "Big purchases",
    average: 2_400,
    recurring: true,
    note: "Per year, covering food, grooming, vet visits and boarding.",
  },

  // Money coming in — negative amounts
  {
    id: "annual-bonus",
    title: "Annual bonus",
    group: "Money coming in",
    average: -10_000,
    recurring: true,
    note: "Per year, roughly two months of salary. Leave this out if your income figure already averages it in.",
  },
  {
    id: "epf-lump-sum",
    title: "EPF lump sum withdrawal (age 55)",
    group: "Money coming in",
    average: -200_000,
    recurring: false,
    note: "Your EPF balance at 55. Check your real i-Akaun balance and project it forward rather than trusting this figure.",
  },
  {
    id: "downsizing",
    title: "Downsizing home (net sale proceeds)",
    group: "Money coming in",
    average: -200_000,
    recurring: false,
    note: "Sale price minus the outstanding loan, agent fees and the cost of the replacement home.",
  },
  {
    id: "sell-car",
    title: "Selling a car",
    group: "Money coming in",
    average: -30_000,
    recurring: false,
    note: "Trade-in or private sale value, net of any outstanding hire purchase.",
  },
  {
    id: "inheritance",
    title: "Inheritance",
    group: "Money coming in",
    average: -100_000,
    recurring: false,
    note: "Entirely situational — this is a placeholder, not an estimate of your own case.",
  },
];

/** Whether this preset is money coming in rather than going out. */
export function isInflow(preset: EventPreset): boolean {
  return preset.average < 0;
}

/**
 * Turns a ticked preset into a CustomEvent ready to save. Recurring presets
 * with a `defaultYears` get an end year; open-ended ones run to the end of the
 * timeline. The average is already signed, so inflows carry through negative.
 */
export function eventFromPreset(
  preset: EventPreset,
  startYear: number,
): CustomEvent {
  return {
    id: crypto.randomUUID(),
    title: preset.title,
    startYear,
    endYear:
      preset.recurring && preset.defaultYears !== undefined
        ? startYear + preset.defaultYears - 1
        : undefined,
    amount: preset.average,
    recurring: preset.recurring,
    notes: `Average estimate — ${preset.note}`,
  };
}
