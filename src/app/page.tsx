"use client";

import { useRef, useState } from "react";
import { useAppState } from "@/hooks/useAppState";
import FirstRunSetup from "@/components/FirstRunSetup";
import { computeTimeline } from "@/lib/calculations";
import { exportStateToFile, importStateFromFile, ImportError } from "@/lib/exportImport";

const CURRENT_YEAR = new Date().getFullYear();
const currencyFormatter = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});

export default function Home() {
  const { state, setState, isLoaded } = useAppState();
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLoaded || !state) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!state.profile) {
    return <FirstRunSetup baseState={state} onComplete={setState} />;
  }

  const timeline = computeTimeline(state, CURRENT_YEAR);
  const thisYear = timeline[0];
  const yearsAhead = timeline.length;

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    try {
      const imported = await importStateFromFile(file);
      setState(imported);
      setImportError(null);
    } catch (err) {
      setImportError(err instanceof ImportError ? err.message : "Import failed.");
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-background px-6 py-16">
      <div className="w-full max-w-lg">
        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Data model wired up
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">
          LifeSavingsStep
        </h1>
        <p className="mt-2 text-muted-foreground">
          Timeline and category views come next — this is confirming the
          numbers underneath are correct.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-md">
          <p className="text-sm text-muted-foreground">This year ({thisYear.year}, age {thisYear.age})</p>
          <p className="mt-1 text-3xl font-semibold text-card-foreground">
            {currencyFormatter.format(thisYear.totalForYear)}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Categories</dt>
              <dd className="font-medium text-card-foreground">{state.categories.length}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Life events</dt>
              <dd className="font-medium text-card-foreground">{state.events.length}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Timeline</dt>
              <dd className="font-medium text-card-foreground">
                {thisYear.year} → {timeline[yearsAhead - 1].year} ({yearsAhead} yrs)
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Currency</dt>
              <dd className="font-medium text-card-foreground">{state.profile.currency}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => exportStateToFile(state)}
            className="flex-1 cursor-pointer rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
          >
            Export backup
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 cursor-pointer rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
          >
            Import backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
        {importError && <p className="mt-2 text-sm text-danger">{importError}</p>}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Category amounts are placeholders — real data comes with the
          category management UI (see PROJECT.md, step 4).
        </p>
      </div>
    </div>
  );
}
