"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { CustomEvent } from "@/lib/types";

interface EventFormModalProps {
  /** Omit to create a new event; pass an existing one to edit it. */
  event?: CustomEvent;
  currentYear: number;
  onSave: (event: CustomEvent) => void;
  onClose: () => void;
}

export default function EventFormModal({
  event,
  currentYear,
  onSave,
  onClose,
}: EventFormModalProps) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [recurring, setRecurring] = useState(event?.recurring ?? false);
  const [startYear, setStartYear] = useState(String(event?.startYear ?? currentYear));
  const [endYear, setEndYear] = useState(event?.endYear !== undefined ? String(event.endYear) : "");
  const [amount, setAmount] = useState(String(event?.amount ?? ""));
  const [notes, setNotes] = useState(event?.notes ?? "");
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

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    const start = Number(startYear);
    if (!Number.isInteger(start)) {
      setError("Start year must be a whole number.");
      return;
    }
    let end: number | undefined;
    if (recurring && endYear.trim() !== "") {
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
    const amt = Number(amount);
    if (!Number.isFinite(amt)) {
      setError("Amount must be a number.");
      return;
    }

    onSave({
      id: event?.id ?? crypto.randomUUID(),
      title: title.trim(),
      startYear: start,
      endYear: recurring ? end : undefined,
      amount: amt,
      recurring,
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
        aria-labelledby="event-form-heading"
      >
        <h2 id="event-form-heading" className="text-lg font-semibold text-card-foreground">
          {event ? "Edit life event" : "Add life event"}
        </h2>

        <label className={`mt-5 block ${labelClass}`} htmlFor="ev-title">
          Title
        </label>
        <input
          id="ev-title"
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Wedding"
          autoFocus
        />

        <div className="mt-4 flex gap-2 rounded-lg bg-muted p-1 text-sm">
          <button
            type="button"
            onClick={() => setRecurring(false)}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
              !recurring ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            One-time
          </button>
          <button
            type="button"
            onClick={() => setRecurring(true)}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
              recurring ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Recurring
          </button>
        </div>

        <div className={`mt-4 grid gap-3 ${recurring ? "grid-cols-2" : "grid-cols-1"}`}>
          <div>
            <label className={`block ${labelClass}`} htmlFor="ev-start">
              {recurring ? "Starts" : "Year"}
            </label>
            <input
              id="ev-start"
              className={inputClass}
              type="number"
              inputMode="numeric"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
            />
          </div>
          {recurring && (
            <div>
              <label className={`block ${labelClass}`} htmlFor="ev-end">
                Ends (optional)
              </label>
              <input
                id="ev-end"
                className={inputClass}
                type="number"
                inputMode="numeric"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder="Runs to end of timeline"
              />
            </div>
          )}
        </div>

        <label className={`mt-4 block ${labelClass}`} htmlFor="ev-amount">
          {recurring ? "Amount per year (RM)" : "Total amount (RM)"}
        </label>
        <input
          id="ev-amount"
          className={inputClass}
          type="number"
          step="0.01"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Negative reduces the total for that {recurring ? "period" : "year"} — e.g. a
          one-time inflow from downsizing.
        </p>

        <label className={`mt-4 block ${labelClass}`} htmlFor="ev-notes">
          Notes (optional)
        </label>
        <textarea
          id="ev-notes"
          className={`${inputClass} min-h-16 resize-y`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. estimated venue + catering cost"
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
            {event ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
