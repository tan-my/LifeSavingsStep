import type {
  AppState,
  Category,
  CustomEvent,
  CategoryGroup,
  IncomeSource,
  UserProfile,
} from "./types";

const WEEKS_PER_MONTH = 52 / 12;

/** An income source's monthly equivalent at its base rate — the amount as-is
 * if already monthly, or hourly rate × hours/week × (52/12) if hourly. An
 * hourly source with no hoursPerWeek set contributes 0 (never assumes a work
 * schedule the user didn't enter). Ignores raises; see
 * monthlyIncomeAmountInYear for the projected figure. */
export function monthlyIncomeAmount(source: IncomeSource): number {
  if (source.rateUnit === "monthly") return source.amount;
  return source.amount * (source.hoursPerWeek ?? 0) * WEEKS_PER_MONTH;
}

/** An income source's monthly rate in a given year, compounding
 * `growthRatePerYear` from the source's own start year — so a job starting in
 * 2030 with 3% raises is at its base rate in 2030, not already grown. */
export function monthlyIncomeAmountInYear(source: IncomeSource, year: number): number {
  const base = monthlyIncomeAmount(source);
  const yearsElapsed = Math.max(0, year - source.startYear);
  return base * Math.pow(1 + source.growthRatePerYear / 100, yearsElapsed);
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

/** This income source's contribution to `year`, at the entered basis
 * (gross or net — whichever the profile says), prorated by month. */
export function incomeAmountInYear(source: IncomeSource, year: number): number {
  return monthlyIncomeAmountInYear(source, year) * monthsActiveInYear(source, year);
}

/**
 * The fraction of gross pay that never reaches the bank account for this
 * source — the EPF employee share (only where EPF applies) plus tax/SOCSO/EIS.
 * Clamped below 1 so a mis-entered 100% deduction can't divide by zero or
 * produce a negative take-home.
 */
function deductionFraction(source: IncomeSource, profile: UserProfile): number {
  const epfShare =
    profile.epf.enabled && source.epfApplies ? profile.epf.employeeRate / 100 : 0;
  const other = profile.otherDeductionRate / 100;
  return Math.min(0.95, Math.max(0, epfShare + other));
}

export interface IncomeYearAmount {
  sourceId: string;
  name: string;
  /** Before deductions. */
  gross: number;
  /** After EPF employee share and other deductions — what can actually be spent. */
  spendable: number;
  /** Employee + employer share paid into the EPF pot this year. */
  epfContribution: number;
}

/**
 * Splits one income source's year into gross, spendable and EPF contribution.
 *
 * The employee EPF share and other deductions come OUT of gross; the employer
 * share is paid on top of salary, so it lands in the pot without reducing
 * take-home. When amounts are entered net, gross is derived back out by
 * dividing through the deduction fraction.
 */
export function incomeBreakdownInYear(
  source: IncomeSource,
  year: number,
  profile: UserProfile,
): IncomeYearAmount {
  const entered = incomeAmountInYear(source, year);
  const deduction = deductionFraction(source, profile);
  const gross =
    profile.incomeBasis === "gross" ? entered : entered / (1 - deduction);
  const spendable = gross * (1 - deduction);
  const epfContribution =
    profile.epf.enabled && source.epfApplies
      ? gross * ((profile.epf.employeeRate + profile.epf.employerRate) / 100)
      : 0;

  return {
    sourceId: source.id,
    name: source.name,
    gross,
    spendable,
    epfContribution,
  };
}

/** Total spendable monthly income from sources active in a specific calendar
 * month — "what actually reaches my account right now", not an annual figure. */
export function totalMonthlyIncome(state: AppState, year: number, month: number): number {
  const { profile } = state;
  if (!profile) return 0;
  return state.incomeSources
    .filter((s) => isIncomeActiveInMonth(s, year, month))
    .reduce((sum, s) => {
      const monthlyEntered = monthlyIncomeAmountInYear(s, year);
      const deduction = deductionFraction(s, profile);
      const monthlyGross =
        profile.incomeBasis === "gross" ? monthlyEntered : monthlyEntered / (1 - deduction);
      return sum + monthlyGross * (1 - deduction);
    }, 0);
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
  /** Per-source income split for this year. */
  incomeAmounts: IncomeYearAmount[];
  /** Total income before deductions. */
  grossIncomeForYear: number;
  /** Income actually available to spend — gross minus EPF employee share and
   * other deductions. This is the figure the balance is built from. */
  incomeForYear: number;
  /** Employee + employer EPF paid into the pot this year. */
  epfContributionForYear: number;
  /** incomeForYear − totalForYear. Positive = spendable savings grew this year. */
  netForYear: number;
  /** Running SPENDABLE balance at the end of this year. Excludes the EPF pot
   * until it is released, which is the point — money locked in EPF cannot pay
   * next year's bills. */
  balance: number;
  /** The EPF pot at the end of this year, after dividends and contributions.
   * Drops to 0 in the year it is released. */
  epfBalance: number;
  /** Amount released from EPF into the spendable balance this year — non-zero
   * only in the year the user reaches the access age. */
  epfReleased: number;
  /** balance + epfBalance — everything owned, spendable or not. */
  totalNetWorth: number;
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
 * user turns `endAge` (inclusive), applying category growth rates, layering
 * custom events on top of the category baseline, projecting income forward
 * with per-source raises, and accruing EPF in a locked pot that is released
 * into the spendable balance at the access age.
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
  const { accessAge, dividendRate, enabled: epfEnabled } = profile.epf;

  const ageAtStart = fromYear - profile.birthYear;
  // Someone already past the access age has their EPF in hand, so it belongs
  // in the spendable balance from day one rather than sitting in a pot that
  // has no release year left on the timeline.
  const alreadyReleased = !epfEnabled || ageAtStart > accessAge;
  let balance = profile.currentSavings + (alreadyReleased ? profile.currentEpfBalance : 0);
  let epfBalance = alreadyReleased ? 0 : profile.currentEpfBalance;

  for (let year = fromYear; year <= endYear; year++) {
    const age = year - profile.birthYear;

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

    const incomeAmounts = state.incomeSources
      .map((s) => incomeBreakdownInYear(s, year, profile))
      .filter((i) => i.gross !== 0 || i.epfContribution !== 0);
    const grossIncomeForYear = sum(incomeAmounts.map((i) => i.gross));
    const incomeForYear = sum(incomeAmounts.map((i) => i.spendable));
    const epfContributionForYear = sum(incomeAmounts.map((i) => i.epfContribution));

    const netForYear = incomeForYear - totalForYear;
    balance += netForYear;

    // Dividend is applied to the opening pot, then the year's contributions are
    // added — a slightly conservative approximation of EPF's own time-weighted
    // calculation, which credits part-year contributions pro rata.
    let epfReleased = 0;
    if (!epfEnabled || alreadyReleased) {
      // No pot to hold: any contributions are immediately spendable.
      balance += epfContributionForYear;
    } else if (age < accessAge) {
      epfBalance = epfBalance * (1 + dividendRate / 100) + epfContributionForYear;
    } else if (age === accessAge) {
      epfBalance = epfBalance * (1 + dividendRate / 100) + epfContributionForYear;
      epfReleased = epfBalance;
      balance += epfReleased;
      epfBalance = 0;
    } else {
      // Past the access age the pot has already been released, so later
      // contributions go straight to the spendable balance.
      balance += epfContributionForYear;
    }

    plans.push({
      year,
      age,
      categoryAmounts,
      categoryTotal,
      eventAmounts,
      eventTotal,
      totalForYear,
      incomeAmounts,
      grossIncomeForYear,
      incomeForYear,
      epfContributionForYear,
      netForYear,
      balance,
      epfBalance,
      epfReleased,
      totalNetWorth: balance + epfBalance,
    });
  }

  return plans;
}

/** The first year the SPENDABLE balance goes negative, or null if it stays
 * non-negative for the whole computed timeline. Deliberately ignores the EPF
 * pot — running out of cash at 40 is still running out, even with a healthy
 * pot you can't touch for another 15 years. */
export function findRunwayEndYear(timeline: YearPlan[]): YearPlan | null {
  return timeline.find((y) => y.balance < 0) ?? null;
}

/** The year the EPF pot is released into the spendable balance, if that
 * happens within the timeline. */
export function findEpfReleaseYear(timeline: YearPlan[]): YearPlan | null {
  return timeline.find((y) => y.epfReleased > 0) ?? null;
}

function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}
