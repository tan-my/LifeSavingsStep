"use client";

import { useEffect, useState, type FormEvent } from "react";

interface SavingsFormModalProps {
  currentSavings: number;
  onSave: (currentSavings: number) => void;
  onClose: () => void;
}

export default function SavingsFormModal({ currentSavings, onSave, onClose }: SavingsFormModalProps) {
  const [value, setValue] = useState(String(currentSavings));
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
    const n = Number(value);
    if (!Number.isFinite(n)) {
      setError("Enter a number.");
      return;
    }
    onSave(n);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="savings-form-heading"
      >
        <h2 id="savings-form-heading" className="text-lg font-semibold text-card-foreground">
          Current savings
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Your total savings/net worth right now — the timeline&apos;s starting balance.
        </p>

        <label className="mt-5 block text-xs font-medium text-card-foreground" htmlFor="savings-amount">
          Amount (RM)
        </label>
        <input
          id="savings-amount"
          type="number"
          step="0.01"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          autoFocus
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}

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
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
