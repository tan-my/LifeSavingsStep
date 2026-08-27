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
  notes?: string;
}

export const SCHEMA_VERSION = 2;

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
 * to the current shape. State saved before `incomeSources` existed (schema
 * v1) won't have that field at runtime even though the type says it's
 * required — this backfills it rather than crashing or discarding the rest
 * of the user's data.
 */
export function normalizeState(raw: AppState): AppState {
  let state = raw;
  if (!Array.isArray((state as { incomeSources?: unknown }).incomeSources)) {
    state = { ...state, incomeSources: [] };
  }
  if (state.schemaVersion !== SCHEMA_VERSION) {
    state = { ...state, schemaVersion: SCHEMA_VERSION };
  }
  return state;
}
