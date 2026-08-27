"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CATEGORY_GROUPS, type AmountUnit, type Category, type CategoryGroup } from "@/lib/types";

interface CategoryFormModalProps {
  /** Omit to create a new category; pass an existing one to edit it. */
  category?: Category;
  defaultGroup?: CategoryGroup;
  onSave: (category: Category) => void;
  onClose: () => void;
}

export default function CategoryFormModal({
  category,
  defaultGroup,
  onSave,
  onClose,
}: CategoryFormModalProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [group, setGroup] = useState<CategoryGroup>(
    category?.group ?? defaultGroup ?? "Essentials",
  );
  const [baseAmount, setBaseAmount] = useState(String(category?.baseAmount ?? ""));
  const [amountUnit, setAmountUnit] = useState<AmountUnit>(category?.amountUnit ?? "monthly");
  const [growthRatePerYear, setGrowthRatePerYear] = useState(
    String(category?.growthRatePerYear ?? 0),
  );
  const [notes, setNotes] = useState(category?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    const amount = Number(baseAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Amount must be a number 0 or greater.");
      return;
    }
    const growth = Number(growthRatePerYear);
    if (!Number.isFinite(growth)) {
      setError("Growth rate must be a number.");
      return;
    }

    onSave({
      id: category?.id ?? crypto.randomUUID(),
      name: name.trim(),
      group,
      baseAmount: amount,
      amountUnit,
      growthRatePerYear: growth,
      notes: notes.trim() || undefined,
    });
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20";
  const labelClass = "text-xs font-medium text-card-foreground";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-8 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-heading"
      >
        <h2 id="category-form-heading" className="text-lg font-semibold text-card-foreground">
          {category ? "Edit category" : "Add category"}
        </h2>

        <label className={`mt-5 block ${labelClass}`} htmlFor="cat-name">
          Name
        </label>
        <input
          id="cat-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Groceries"
          autoFocus
        />

        <label className={`mt-4 block ${labelClass}`} htmlFor="cat-group">
          Group
        </label>
        <select
          id="cat-group"
          className={inputClass}
          value={group}
          onChange={(e) => setGroup(e.target.value as CategoryGroup)}
        >
          {CATEGORY_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className={`block ${labelClass}`} htmlFor="cat-amount">
              Amount (RM)
            </label>
            <input
              id="cat-amount"
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className={`block ${labelClass}`} htmlFor="cat-unit">
              Per
            </label>
            <select
              id="cat-unit"
              className={inputClass}
              value={amountUnit}
              onChange={(e) => setAmountUnit(e.target.value as AmountUnit)}
            >
              <option value="monthly">Month</option>
              <option value="yearly">Year</option>
            </select>
          </div>
        </div>

        <label className={`mt-4 block ${labelClass}`} htmlFor="cat-growth">
          Growth rate per year (%, optional)
        </label>
        <input
          id="cat-growth"
          className={inputClass}
          type="number"
          step="0.1"
          inputMode="decimal"
          value={growthRatePerYear}
          onChange={(e) => setGrowthRatePerYear(e.target.value)}
          placeholder="0"
        />

        <label className={`mt-4 block ${labelClass}`} htmlFor="cat-notes">
          Notes / source (optional)
        </label>
        <textarea
          id="cat-notes"
          className={`${inputClass} min-h-16 resize-y`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. based on 2026 city average"
        />

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-lg border-2 border-primary px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            {category ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
