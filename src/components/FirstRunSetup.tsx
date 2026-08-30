"use client";

import { useState, type FormEvent } from "react";
import { DEFAULT_EPF_SETTINGS, type AppState } from "@/lib/types";

interface FirstRunSetupProps {
  onComplete: (state: AppState) => void;
  baseState: AppState;
}

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Collects birth year (directly, or derived from current age) on first launch.
 * Everything else in AppState (categories, events) is already seeded by the
 * time this renders — this only needs to fill in `profile`.
 */
export default function FirstRunSetup({ onComplete, baseState }: FirstRunSetupProps) {
  const [mode, setMode] = useState<"age" | "year">("age");
  const [value, setValue] = useState("");
  const [savings, setSavings] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const n = Number(value);

    if (!Number.isInteger(n)) {
      setError("Enter a whole number.");
      return;
    }

    let birthYear: number;
    if (mode === "age") {
      if (n < 0 || n > 120) {
        setError("Enter an age between 0 and 120.");
        return;
      }
      birthYear = CURRENT_YEAR - n;
    } else {
      if (n < CURRENT_YEAR - 120 || n > CURRENT_YEAR) {
        setError(`Enter a birth year between ${CURRENT_YEAR - 120} and ${CURRENT_YEAR}.`);
        return;
      }
      birthYear = n;
    }

    let currentSavings = 0;
    if (savings.trim() !== "") {
      currentSavings = Number(savings);
      if (!Number.isFinite(currentSavings)) {
        setError("Current savings must be a number.");
        return;
      }
    }

    onComplete({
      ...baseState,
      profile: {
        birthYear,
        currency: "MYR",
        createdAt: new Date().toISOString(),
        currentSavings,
        // The remaining projection settings all have workable defaults and are
        // editable from the dashboard, so first run stays a two-field screen.
        currentEpfBalance: 0,
        incomeBasis: "gross",
        otherDeductionRate: 0,
        epf: { ...DEFAULT_EPF_SETTINGS },
      },
    });
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-md"
      >
        <h1 className="text-xl font-semibold text-card-foreground">
          Let&apos;s set up your timeline
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your timeline runs from this year to age 100. We just need a
          starting point.
        </p>

        <div className="mt-6 flex gap-2 rounded-lg bg-muted p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("age")}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
              mode === "age"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            My age
          </button>
          <button
            type="button"
            onClick={() => setMode("year")}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
              mode === "year"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Birth year
          </button>
        </div>

        <label className="mt-4 block text-sm font-medium text-card-foreground" htmlFor="value">
          {mode === "age" ? "Current age" : "Birth year"}
        </label>
        <input
          id="value"
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          placeholder={mode === "age" ? "e.g. 30" : `e.g. ${CURRENT_YEAR - 30}`}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
        <label className="mt-4 block text-sm font-medium text-card-foreground" htmlFor="savings">
          Current savings (RM, optional)
        </label>
        <input
          id="savings"
          type="number"
          step="0.01"
          inputMode="decimal"
          value={savings}
          onChange={(e) => {
            setSavings(e.target.value);
            setError(null);
          }}
          placeholder="0"
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Your timeline&apos;s starting balance. You can change this anytime later.
        </p>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}

        <button
          type="submit"
          className="mt-6 w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
