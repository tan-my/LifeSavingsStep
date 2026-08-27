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

function toAbsoluteMonth(year: number, month: number): number {
  return year * 12 + (month - 1);
}

/** An income source's [start, end] as absolute month indices — end is
 * +Infinity when the source has no endYear (runs indefinitely). */
function activeMonthRange(source: IncomeSource): [number, number] {
  const start = toAbsoluteMonth(source.startYear, source.startMonth);
  const end =
    source.endYear !== undefined
      ? toAbsoluteMonth(source.endYear, source.endMonth ?? 12)
      : Infinity;
  return [start, end];
}

/** Whether an income source is active in a specific calendar month. */
export function isIncomeActiveInMonth(source: IncomeSource, year: number, month: number): boolean {
  const [start, end] = activeMonthRange(source);
  const target = toAbsoluteMonth(year, month);
  return target >= start && target <= end;
}

/** How many months of `year` this income source is active for (0-12) — a
 * source that only covers part of the year (e.g. a 4-month contract) is
 * prorated rather than counted as a full year. */
export function monthsActiveInYear(source: IncomeSource, year: number): number {
  const [start, end] = activeMonthRange(source);
  const yearStart = toAbsoluteMonth(year, 1);
  const yearEnd = toAbsoluteMonth(year, 12);
  const overlapStart = Math.max(start, yearStart);
  const overlapEnd = Math.min(end, yearEnd);
  return Math.max(0, overlapEnd - overlapStart + 1);
}

/** This income source's contribution to `year`'s total, prorated by month. */
export function incomeAmountInYear(source: IncomeSource, year: number): number {
  return monthlyIncomeAmount(source) * monthsActiveInYear(source, year);
}

/** Total monthly income from sources active in a specific calendar month —
 * "what am I earning right now", not an annual/prorated figure. */
export function totalMonthlyIncome(state: AppState, year: number, month: number): number {
  return state.incomeSources
    .filter((s) => isIncomeActiveInMonth(s, year, month))
    .reduce((sum, s) => sum + monthlyIncomeAmount(s), 0);
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
  /** Income for this year — each source's monthly rate × the months of this
   * year it was active for (prorated for a source that starts/ends mid-year),
   * at its current rate (no growth modeled, e.g. no raises). */
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
    const incomeForYear = sum(state.incomeSources.map((s) => incomeAmountInYear(s, year)));
    const netForYear = incomeForYear - totalForYear;
    balance += netForYear;

    plans.push({
      year,
      age: year - profile.birthYear,
      categoryAmounts,
      categoryTotal,
      eventAmounts,
      eventTotal,
      totalForYear,
      incomeForYear,
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
