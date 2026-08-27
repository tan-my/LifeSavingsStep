"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { IncomeRateUnit, IncomeSource } from "@/lib/types";

interface IncomeFormModalProps {
  /** Omit to create a new income source; pass an existing one to edit it. */
  source?: IncomeSource;
  currentYear: number;
  onSave: (source: IncomeSource) => void;
  onClose: () => void;
}

export default function IncomeFormModal({
  source,
  currentYear,
  onSave,
  onClose,
}: IncomeFormModalProps) {
  const [name, setName] = useState(source?.name ?? "");
  const [rateUnit, setRateUnit] = useState<IncomeRateUnit>(source?.rateUnit ?? "monthly");
  const [amount, setAmount] = useState(String(source?.amount ?? ""));
  const [hoursPerWeek, setHoursPerWeek] = useState(
    source?.hoursPerWeek !== undefined ? String(source.hoursPerWeek) : "",
  );
  const [startYear, setStartYear] = useState(String(source?.startYear ?? currentYear));
  const [endYear, setEndYear] = useState(source?.endYear !== undefined ? String(source.endYear) : "");
  const [notes, setNotes] = useState(source?.notes ?? "");
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
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 0) {
      setError("Amount must be a number 0 or greater.");
      return;
    }
    let hours: number | undefined;
    if (rateUnit === "hourly" && hoursPerWeek.trim() !== "") {
      hours = Number(hoursPerWeek);
      if (!Number.isFinite(hours) || hours < 0) {
        setError("Hours/week must be a number 0 or greater.");
        return;
      }
    }
    const start = Number(startYear);
    if (!Number.isInteger(start)) {
      setError("Start year must be a whole number.");
      return;
    }
    let end: number | undefined;
    if (endYear.trim() !== "") {
      end = Number(endYear);
      if (!Number.isInteger(end)) {
        setError("End year must be a whole number.");
        return;
      }
      if (end < start) {
        setError("End year can't be before the start year.");
        return;
      }
    }

    onSave({
      id: source?.id ?? crypto.randomUUID(),
      name: name.trim(),
      rateUnit,
      amount: amt,
      hoursPerWeek: rateUnit === "hourly" ? hours : undefined,
      startYear: start,
      endYear: end,
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
        aria-labelledby="income-form-heading"
      >
        <h2 id="income-form-heading" className="text-lg font-semibold text-card-foreground">
          {source ? "Edit income source" : "Add income source"}
        </h2>

        <label className={`mt-5 block ${labelClass}`} htmlFor="inc-name">
          Name
        </label>
        <input
          id="inc-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Full-time job, Freelance project"
          autoFocus
        />

        <div className="mt-4 flex gap-2 rounded-lg bg-muted p-1 text-sm">
          <button
            type="button"
            onClick={() => setRateUnit("monthly")}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
              rateUnit === "monthly" ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setRateUnit("hourly")}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
              rateUnit === "hourly" ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Hourly
          </button>
        </div>

        <div className={`mt-4 grid gap-3 ${rateUnit === "hourly" ? "grid-cols-2" : "grid-cols-1"}`}>
          <div>
            <label className={`block ${labelClass}`} htmlFor="inc-amount">
              {rateUnit === "monthly" ? "Amount / month (RM)" : "Rate / hour (RM)"}
            </label>
            <input
              id="inc-amount"
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          {rateUnit === "hourly" && (
            <div>
              <label className={`block ${labelClass}`} htmlFor="inc-hours">
                Hours / week
              </label>
              <input
                id="inc-hours"
                className={inputClass}
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                placeholder="0"
              />
            </div>
          )}
        </div>
        {rateUnit === "hourly" && (
          <p className="mt-1 text-xs text-muted-foreground">
            Used to estimate a monthly equivalent — left blank, this source
            won&apos;t count toward the monthly total.
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className={`block ${labelClass}`} htmlFor="inc-start">
              Starts
            </label>
            <input
              id="inc-start"
              className={inputClass}
              type="number"
              inputMode="numeric"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
            />
          </div>
          <div>
            <label className={`block ${labelClass}`} htmlFor="inc-end">
              Ends (optional)
            </label>
            <input
              id="inc-end"
              className={inputClass}
              type="number"
              inputMode="numeric"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              placeholder="Ongoing"
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          The period this income applies — e.g. a job&apos;s start date, or a
          contract&apos;s length. Leave &quot;Ends&quot; blank if it&apos;s ongoing.
        </p>

        <label className={`mt-4 block ${labelClass}`} htmlFor="inc-notes">
          Notes (optional)
        </label>
        <textarea
          id="inc-notes"
          className={`${inputClass} min-h-16 resize-y`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. client, contract length"
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
            {source ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
