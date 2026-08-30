/**
 * Core data model for LifeSavingsStep.
 * See PROJECT.md "Data model" for the prose version — this is the source of truth.
 */

export type CategoryGroup =
  | "Essentials"
  | "Obligations"
  | "Lifestyle"
  | "Financial Goals"
  | "Miscellaneous";

export const CATEGORY_GROUPS: CategoryGroup[] = [
  "Essentials",
  "Obligations",
  "Lifestyle",
  "Financial Goals",
  "Miscellaneous",
];

export type AmountUnit = "monthly" | "yearly";

export interface Category {
  id: string;
  name: string;
  group: CategoryGroup;
  /** Cost in the unit given by `amountUnit`. Always >= 0. */
  baseAmount: number;
  amountUnit: AmountUnit;
  /** Optional yearly % growth applied compounding from the current year, e.g. 3 for 3%/yr. Default 0. */
  growthRatePerYear: number;
  notes?: string;
}

export interface CustomEvent {
  id: string;
  title: string;
  /** Year the event starts (one-time cost year, or first year of a recurring cost). */
  startYear: number;
  /** Only meaningful when recurring — last year the cost applies. Omitted = runs to the end of the timeline. */
  endYear?: number;
  /** One-time total if !recurring, otherwise the amount charged per year. */
  amount: number;
  recurring: boolean;
  notes?: string;
}

/**
 * Whether the amounts on income sources are entered before deductions
 * ("gross" — the salary figure on an offer letter) or after them ("net" — what
 * actually lands in the bank). The projection needs to know which, because EPF
 * contributions are a percentage of gross.
 */
export type IncomeBasis = "gross" | "net";

/**
 * Retirement-fund settings. EPF is modelled as a pot separate from spendable
 * savings: contributions accrue and compound at the dividend rate, but the
 * money cannot be spent until `accessAge`, at which point the whole balance is
 * released into the spendable balance.
 */
export interface EpfSettings {
  /** Turn the whole EPF model off — no contributions, no pot, no unlock. */
  enabled: boolean;
  /** Employee share, % of gross. Comes OUT of take-home pay. Statutory default 11. */
  employeeRate: number;
  /** Employer share, % of gross. Paid on top of salary, so it does NOT reduce take-home. */
  employerRate: number;
  /** Assumed annual dividend, %. */
  dividendRate: number;
  /** Age at which the balance becomes withdrawable. */
  accessAge: number;
}

export const DEFAULT_EPF_SETTINGS: EpfSettings = {
  enabled: true,
  employeeRate: 11,
  employerRate: 13,
  dividendRate: 5.5,
  accessAge: 55,
};

export interface UserProfile {
  /** Birth year, used to derive the age-100 timeline end. */
  birthYear: number;
  currency: "MYR";
  createdAt: string; // ISO timestamp
  /** Spendable savings right now. The projection's starting liquid balance. */
  currentSavings: number;
  /** Current EPF balance. Tracked separately because it is locked until accessAge. */
  currentEpfBalance: number;
  /** Whether income amounts are entered gross or net. See IncomeBasis. */
  incomeBasis: IncomeBasis;
  /**
   * Everything deducted from gross pay that ISN'T EPF — income tax (PCB),
   * SOCSO, EIS — as a single % of gross. EPF is modelled separately via
   * EpfSettings, so don't include it here or it will be counted twice.
   */
  otherDeductionRate: number;
  epf: EpfSettings;
}

export type IncomeRateUnit = "monthly" | "hourly";

export interface IncomeSource {
  id: string;
  name: string;
  rateUnit: IncomeRateUnit;
  /** RM per month if rateUnit is "monthly", RM per hour if "hourly". */
  amount: number;
  /** Only meaningful when rateUnit is "hourly" — used to derive a monthly equivalent. */
  hoursPerWeek?: number;
  /** Year+month this income starts (e.g. when the job starts/started). Month is 1-12. */
  startYear: number;
  startMonth: number;
  /** Last year+month this income applies (inclusive) — endYear omitted means it
   * runs to the end of the timeline. A source active for only part of a
   * calendar year (e.g. a 4-month contract) is prorated by month, not
   * counted as a full year. */
  endYear?: number;
  endMonth?: number;
  /**
   * Yearly % raise, compounding from this source's own start year — e.g. 3 for
   * a 3%/yr raise. Default 0, which holds the rate flat forever.
   */
  growthRatePerYear: number;
  /**
   * Whether statutory EPF contributions accrue on this source. True for
   * salaried employment; false for freelance work, rental and dividends.
   */
  epfApplies: boolean;
  notes?: string;
}

/** Sentinel used only by normalizeState() to backfill startYear on income
 * sources saved before periods existed — old behavior was "always active",
 * so an arbitrarily early year preserves that rather than guessing "now". */
const EARLIEST_PLAUSIBLE_YEAR = 1900;

export const SCHEMA_VERSION = 6;

export interface AppState {
  schemaVersion: number;
  profile: UserProfile | null;
  categories: Category[];
  events: CustomEvent[];
  incomeSources: IncomeSource[];
}

export function createEmptyState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: null,
    categories: [],
    events: [],
    incomeSources: [],
  };
}

/**
 * Brings a parsed AppState (from localStorage or an imported backup file) up
 * to the current shape. State saved before a field existed won't have it at
 * runtime even though the type says it's required — this backfills rather
 * than crashing or discarding the rest of the user's data.
 */
export function normalizeState(raw: AppState): AppState {
  let state = raw;
  if (!Array.isArray((state as { incomeSources?: unknown }).incomeSources)) {
    state = { ...state, incomeSources: [] };
  }

  if (state.profile !== null) {
    type LegacyProfile = Partial<UserProfile>;
    const p = state.profile as UserProfile & LegacyProfile;
    const needsProfileBackfill =
      typeof p.currentSavings !== "number" ||
      typeof p.currentEpfBalance !== "number" ||
      typeof p.otherDeductionRate !== "number" ||
      (p.incomeBasis !== "gross" && p.incomeBasis !== "net") ||
      typeof p.epf !== "object" ||
      p.epf === null;

    if (needsProfileBackfill) {
      state = {
        ...state,
        profile: {
          ...p,
          currentSavings: typeof p.currentSavings === "number" ? p.currentSavings : 0,
          currentEpfBalance:
            typeof p.currentEpfBalance === "number" ? p.currentEpfBalance : 0,
          // Existing users entered their income under no stated convention, and
          // the app previously spent every ringgit of it. "gross" with a 0%
          // deduction rate reproduces exactly that, so nobody's projection
          // shifts until they opt in.
          incomeBasis: p.incomeBasis === "net" ? "net" : "gross",
          otherDeductionRate:
            typeof p.otherDeductionRate === "number" ? p.otherDeductionRate : 0,
          epf:
            typeof p.epf === "object" && p.epf !== null
              ? { ...DEFAULT_EPF_SETTINGS, ...p.epf }
              : { ...DEFAULT_EPF_SETTINGS },
        },
      };
    }
  }

  type LegacyIncomeSource = {
    startYear?: unknown;
    startMonth?: unknown;
    endYear?: unknown;
    endMonth?: unknown;
    growthRatePerYear?: unknown;
    epfApplies?: unknown;
  };
  if (
    state.incomeSources.some((raw) => {
      const s = raw as LegacyIncomeSource;
      return (
        typeof s.startYear !== "number" ||
        typeof s.startMonth !== "number" ||
        typeof s.growthRatePerYear !== "number" ||
        typeof s.epfApplies !== "boolean" ||
        (s.endYear !== undefined && typeof s.endMonth !== "number")
      );
    })
  ) {
    state = {
      ...state,
      incomeSources: state.incomeSources.map((raw) => {
        const s = raw as IncomeSource & LegacyIncomeSource;
        return {
          ...s,
          startYear: typeof s.startYear === "number" ? s.startYear : EARLIEST_PLAUSIBLE_YEAR,
          startMonth: typeof s.startMonth === "number" ? s.startMonth : 1,
          endMonth: s.endYear !== undefined ? (typeof s.endMonth === "number" ? s.endMonth : 12) : undefined,
          growthRatePerYear:
            typeof s.growthRatePerYear === "number" ? s.growthRatePerYear : 0,
          // Deliberately false, not true: switching an existing source to
          // EPF-eligible would silently cut its take-home by the employee rate.
          // The user opts in per source instead.
          epfApplies: typeof s.epfApplies === "boolean" ? s.epfApplies : false,
        };
      }),
    };
  }

  if (state.schemaVersion !== SCHEMA_VERSION) {
    state = { ...state, schemaVersion: SCHEMA_VERSION };
  }
  return state;
}
