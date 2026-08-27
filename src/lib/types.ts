/**
 * Core data model for LifeSavingsStep.
 * See PROJECT.md "Data model (draft, subject to change)" for the original sketch —
 * this is that sketch made concrete in TypeScript.
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

export interface UserProfile {
  /** Birth year, used to derive the age-100 timeline end. */
  birthYear: number;
  currency: "MYR";
  createdAt: string; // ISO timestamp
  /** Current total savings/net worth, as of now. The timeline's starting balance. */
  currentSavings: number;
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
  notes?: string;
}

/** Sentinel used only by normalizeState() to backfill startYear on income
 * sources saved before periods existed — old behavior was "always active",
 * so an arbitrarily early year preserves that rather than guessing "now". */
const EARLIEST_PLAUSIBLE_YEAR = 1900;

export const SCHEMA_VERSION = 5;

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
  if (
    state.profile !== null &&
    typeof (state.profile as { currentSavings?: unknown }).currentSavings !== "number"
  ) {
    state = { ...state, profile: { ...state.profile, currentSavings: 0 } };
  }
  type LegacyIncomeSource = { startYear?: unknown; startMonth?: unknown; endYear?: unknown; endMonth?: unknown };
  if (
    state.incomeSources.some((raw) => {
      const s = raw as LegacyIncomeSource;
      return (
        typeof s.startYear !== "number" ||
        typeof s.startMonth !== "number" ||
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
        };
      }),
    };
  }
  if (state.schemaVersion !== SCHEMA_VERSION) {
    state = { ...state, schemaVersion: SCHEMA_VERSION };
  }
  return state;
}
