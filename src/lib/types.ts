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

export const SCHEMA_VERSION = 1;

export interface AppState {
  schemaVersion: number;
  profile: UserProfile | null;
  categories: Category[];
  events: CustomEvent[];
}

export function createEmptyState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: null,
    categories: [],
    events: [],
  };
}
