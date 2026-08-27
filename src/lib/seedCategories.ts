import type { Category } from "./types";

/**
 * Starter categories from PROJECT.md's "Suggested expense categories".
 * Seeded at amount 0 with a placeholder note — real numbers are an open
 * question (see PROJECT.md "Open questions / decisions still needed") and
 * get filled in once category management UI exists. Trim, rename, merge,
 * or delete freely once that UI is built.
 */
export function seedCategories(): Category[] {
  const placeholder = (
    name: string,
    group: Category["group"],
  ): Category => ({
    id: crypto.randomUUID(),
    name,
    group,
    baseAmount: 0,
    amountUnit: "monthly",
    growthRatePerYear: 0,
    notes: "Placeholder — needs real data",
  });

  return [
    // Essentials
    placeholder("Housing (rent/mortgage, property tax, home insurance)", "Essentials"),
    placeholder("Utilities (electricity, water, gas, internet, phone)", "Essentials"),
    placeholder("Groceries / food", "Essentials"),
    placeholder("Transportation (car payment, fuel, transit, maintenance, insurance)", "Essentials"),
    placeholder("Healthcare (insurance premiums, out-of-pocket, dental, vision)", "Essentials"),
    placeholder("Insurance (life, disability)", "Essentials"),

    // Obligations
    placeholder("Debt repayment (student loans, credit cards, personal loans)", "Obligations"),
    placeholder("Taxes (if not auto-deducted)", "Obligations"),
    placeholder("Childcare / education (school fees, tuition, supplies)", "Obligations"),

    // Lifestyle
    placeholder("Personal care (clothing, grooming, gym)", "Lifestyle"),
    placeholder("Entertainment / subscriptions (streaming, hobbies, dining out)", "Lifestyle"),
    placeholder("Travel / vacation", "Lifestyle"),
    placeholder("Gifts / donations", "Lifestyle"),

    // Financial goals
    placeholder("Emergency fund contribution", "Financial Goals"),
    placeholder("Retirement / long-term savings contribution", "Financial Goals"),
    placeholder("Other savings goals (down payment, big purchase fund)", "Financial Goals"),

    // Miscellaneous
    placeholder("Buffer / unplanned expenses", "Miscellaneous"),
  ];
}
