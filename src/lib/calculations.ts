import type { AppState, Category, CustomEvent, CategoryGroup } from "./types";

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
  totalForYear: number;
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

    plans.push({
      year,
      age: year - profile.birthYear,
      categoryAmounts,
      categoryTotal,
      eventAmounts,
      eventTotal,
      totalForYear: categoryTotal + eventTotal,
    });
  }

  return plans;
}

function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}
