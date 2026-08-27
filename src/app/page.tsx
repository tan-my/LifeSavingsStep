"use client";

import { useRef, useState } from "react";
import { useAppState } from "@/hooks/useAppState";
import FirstRunSetup from "@/components/FirstRunSetup";
import TimelineChart from "@/components/TimelineChart";
import YearDetailModal from "@/components/YearDetailModal";
import { computeTimeline } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { exportStateToFile, importStateFromFile, ImportError } from "@/lib/exportImport";

const CURRENT_YEAR = new Date().getFullYear();

export default function Home() {
  const { state, setState, isLoaded } = useAppState();
  const [importError, setImportError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
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
  const selectedYearPlan = timeline.find((y) => y.year === selectedYear) ?? null;

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
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
    <div className="flex flex-1 flex-col bg-background px-6 py-12">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Your timeline</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {thisYear.year} (age {thisYear.age}) →{" "}
              {timeline[timeline.length - 1].year} (age {timeline[timeline.length - 1].age})
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportStateToFile(state)}
              className="cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
            >
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
            >
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>
        {importError && <p className="mt-2 text-sm text-danger">{importError}</p>}

        <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-md">
          <p className="text-sm text-muted-foreground">This year ({thisYear.year})</p>
          <p className="mt-1 text-3xl font-semibold text-card-foreground">
            {formatCurrency(thisYear.totalForYear)}
          </p>
        </div>

        <div className="mt-6">
          <TimelineChart years={timeline} onSelectYear={setSelectedYear} />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-md">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((y) => (
                  <tr key={y.year} className="border-b border-border last:border-0">
                    <td className="p-0">
                      <button
                        onClick={() => setSelectedYear(y.year)}
                        className="w-full cursor-pointer px-4 py-2.5 text-left tabular-nums text-card-foreground transition-colors hover:bg-muted"
                      >
                        {y.year}
                      </button>
                    </td>
                    <td className="p-0">
                      <button
                        onClick={() => setSelectedYear(y.year)}
                        className="w-full cursor-pointer px-4 py-2.5 text-left tabular-nums text-muted-foreground transition-colors hover:bg-muted"
                      >
                        {y.age}
                      </button>
                    </td>
                    <td className="p-0">
                      <button
                        onClick={() => setSelectedYear(y.year)}
                        className="w-full cursor-pointer px-4 py-2.5 text-right font-medium tabular-nums text-card-foreground transition-colors hover:bg-muted"
                      >
                        {formatCurrency(y.totalForYear)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Category amounts are placeholders — real data comes with the
          category management UI (see PROJECT.md, step 4).
        </p>
      </div>

      {selectedYearPlan && (
        <YearDetailModal year={selectedYearPlan} onClose={() => setSelectedYear(null)} />
      )}
    </div>
  );
}
