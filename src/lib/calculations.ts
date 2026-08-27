import type { AppState, Category, CustomEvent, CategoryGroup, IncomeSource } from "./types";

const WEEKS_PER_MONTH = 52 / 12;

/** An income source's monthly equivalent — the amount as-is if already
 * monthly, or hourly rate × hours/week × (52/12) if hourly. An hourly
 * source with no hoursPerWeek set contributes 0 (never assumes a work
 * schedule the user didn't enter). */
export function monthlyIncomeAmount(source: IncomeSource): number {
  if (source.rateUnit === "monthly") return source.amount;
  return source.amount * (source.hoursPerWeek ?? 0) * WEEKS_PER_MONTH;
}

/** Total monthly income across every source. */
export function totalMonthlyIncome(state: AppState): number {
  return state.incomeSources.reduce((sum, s) => sum + monthlyIncomeAmount(s), 0);
}

export interface CategoryYearAmount {
  categoryId: string;
  name: string;
  group: CategoryGroup;
  amount: number;
}

export interface EventYearAmount {
  eventId: string;
  title: string;
  amount: number;
}

export interface YearPlan {
  year: number;
  age: number;
  categoryAmounts: CategoryYearAmount[];
  categoryTotal: number;
  eventAmounts: EventYearAmount[];
  eventTotal: number;
  /** Money needed this year — categoryTotal + eventTotal. */
  totalForYear: number;
  /** Income for this year. Income sources have no growth/start/end concept
   * yet, so this is flat (current monthly income × 12) across every year —
   * a known simplification, not a real income projection. */
  incomeForYear: number;
  /** incomeForYear − totalForYear. Positive = savings grew this year. */
  netForYear: number;
  /** Running savings balance at the END of this year — currentSavings plus
   * every year's netForYear up to and including this one. */
  balance: number;
}

/** Annualized cost of a category before growth is applied. */
export function annualBaseAmount(category: Category): number {
  return category.amountUnit === "monthly"
    ? category.baseAmount * 12
    : category.baseAmount;
}

/** A category's cost in a given year, compounding `growthRatePerYear` from `fromYear`. */
function categoryAmountInYear(
  category: Category,
  year: number,
  fromYear: number,
): number {
  const base = annualBaseAmount(category);
  const yearsElapsed = Math.max(0, year - fromYear);
  const growth = 1 + category.growthRatePerYear / 100;
  return base * Math.pow(growth, yearsElapsed);
}

/** A custom event's cost in a given year, or 0 if it doesn't apply that year. */
function eventAmountInYear(event: CustomEvent, year: number): number {
  if (!event.recurring) {
    return year === event.startYear ? event.amount : 0;
  }
  const started = year >= event.startYear;
  const notEnded = event.endYear === undefined || year <= event.endYear;
  return started && notEnded ? event.amount : 0;
}

/**
 * Builds the yearly timeline from `fromYear` (inclusive) through the year the
 * user turns `endAge` (inclusive), applying category growth rates and layering
 * custom events on top of the category baseline.
 */
export function computeTimeline(
  state: AppState,
  fromYear: number,
  endAge = 100,
): YearPlan[] {
  const { profile, categories, events } = state;
  if (!profile) return [];

  const endYear = profile.birthYear + endAge;
  const annualIncome = totalMonthlyIncome(state) * 12;
  const plans: YearPlan[] = [];
  let balance = profile.currentSavings;

  for (let year = fromYear; year <= endYear; year++) {
    const categoryAmounts = categories.map((category) => ({
      categoryId: category.id,
      name: category.name,
      group: category.group,
      amount: categoryAmountInYear(category, year, fromYear),
    }));
    const categoryTotal = sum(categoryAmounts.map((c) => c.amount));

    const eventAmounts = events
      .map((event) => ({
        eventId: event.id,
        title: event.title,
        amount: eventAmountInYear(event, year),
      }))
      .filter((e) => e.amount !== 0);
    const eventTotal = sum(eventAmounts.map((e) => e.amount));

    const totalForYear = categoryTotal + eventTotal;
    const netForYear = annualIncome - totalForYear;
    balance += netForYear;

    plans.push({
      year,
      age: year - profile.birthYear,
      categoryAmounts,
      categoryTotal,
      eventAmounts,
      eventTotal,
      totalForYear,
      incomeForYear: annualIncome,
      netForYear,
      balance,
    });
  }

  return plans;
}

/** The first year the running balance goes negative, or null if it stays
 * non-negative for the whole computed timeline. */
export function findRunwayEndYear(timeline: YearPlan[]): YearPlan | null {
  return timeline.find((y) => y.balance < 0) ?? null;
}

function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}
