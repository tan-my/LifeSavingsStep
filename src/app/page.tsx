"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/hooks/useAppState";
import FirstRunSetup from "@/components/FirstRunSetup";
import TimelineChart from "@/components/TimelineChart";
import YearDetailModal from "@/components/YearDetailModal";
import SavingsFormModal from "@/components/SavingsFormModal";
import StatTile from "@/components/StatTile";
import { computeTimeline, findRunwayEndYear, totalMonthlyIncome } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { exportStateToFile, importStateFromFile, ImportError } from "@/lib/exportImport";

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

export default function Home() {
  const { state, setState, isLoaded } = useAppState();
  const [importError, setImportError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [editingSavings, setEditingSavings] = useState(false);
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
  const profile = state.profile;

  const timeline = computeTimeline(state, CURRENT_YEAR);
  const thisYear = timeline[0];
  const lastYear = timeline[timeline.length - 1];
  const selectedYearPlan = timeline.find((y) => y.year === selectedYear) ?? null;
  const peakYear = timeline.reduce((a, b) => (b.totalForYear > a.totalForYear ? b : a));
  const monthlyIncome = totalMonthlyIncome(state, CURRENT_YEAR, CURRENT_MONTH);
  const runwayYear = findRunwayEndYear(timeline);

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

  function handleSaveSavings(currentSavings: number) {
    if (!state) return;
    setState({ ...state, profile: { ...profile, currentSavings } });
    setEditingSavings(false);
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5 sm:px-6">
        <div>
          <h1 className="text-base font-semibold text-foreground">LifeSavingsStep</h1>
          <p className="text-xs text-muted-foreground">
            {thisYear.year} (age {thisYear.age}) → {lastYear.year} (age {lastYear.age})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/categories"
            className="cursor-pointer rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-muted"
          >
            Categories
          </Link>
          <Link
            href="/events"
            className="cursor-pointer rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-muted"
          >
            Life events
          </Link>
          <Link
            href="/income"
            className="cursor-pointer rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-muted"
          >
            Income
          </Link>
          <button
            onClick={() => exportStateToFile(state)}
            className="cursor-pointer rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-muted"
          >
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-muted"
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
      </header>
      {importError && (
        <p className="border-b border-border px-4 py-1.5 text-xs text-danger sm:px-6">{importError}</p>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2 border-b border-border px-4 py-2.5 sm:grid-cols-4 sm:px-6 lg:grid-cols-7">
        <StatTile
          label="Current savings"
          value={formatCurrency(profile.currentSavings)}
          tone={profile.currentSavings < 0 ? "danger" : "default"}
          onClick={() => setEditingSavings(true)}
        />
        <StatTile
          label="Runway"
          value={runwayYear ? `${runwayYear.year}` : "Never depletes"}
          sublabel={runwayYear ? `age ${runwayYear.age}` : `through age ${lastYear.age}`}
          tone={runwayYear ? "danger" : "success"}
        />
        <StatTile label="Monthly income" value={formatCurrency(monthlyIncome)} />
        <StatTile label="This year" value={formatCurrency(thisYear.totalForYear)} />
        <StatTile
          label="Peak year"
          value={formatCurrency(peakYear.totalForYear)}
          sublabel={`${peakYear.year} (age ${peakYear.age})`}
        />
        <StatTile label="Categories" value={String(state.categories.length)} />
        <StatTile label="Life events" value={String(state.events.length)} />
      </div>

      {/* Main: chart + table, both on screen at once — the table scrolls internally */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-3 sm:px-6">
        <div className="shrink-0">
          <TimelineChart years={timeline} onSelectYear={setSelectedYear} />
          <details className="mt-1.5 text-xs text-muted-foreground">
            <summary className="cursor-pointer select-none">About this data</summary>
            <p className="mt-1">
              Category amounts are placeholders — real data comes with the
              category management UI (see PROJECT.md, step 4). Each income
              source applies only within its own start/end period, at a
              flat rate (no raises/growth modeled yet). The balance
              projection is a straight-line estimate, not a guarantee.
            </p>
          </details>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2">Year</th>
                  <th className="px-4 py-2">Age</th>
                  <th className="px-4 py-2 text-right">Income</th>
                  <th className="px-4 py-2 text-right">Needed</th>
                  <th className="px-4 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((y) => (
                  <tr key={y.year} className="border-b border-border last:border-0">
                    <td className="p-0">
                      <button
                        onClick={() => setSelectedYear(y.year)}
                        className="w-full cursor-pointer px-4 py-1.5 text-left tabular-nums text-card-foreground transition-colors hover:bg-muted"
                      >
                        {y.year}
                      </button>
                    </td>
                    <td className="p-0">
                      <button
                        onClick={() => setSelectedYear(y.year)}
                        className="w-full cursor-pointer px-4 py-1.5 text-left tabular-nums text-muted-foreground transition-colors hover:bg-muted"
                      >
                        {y.age}
                      </button>
                    </td>
                    <td className="p-0">
                      <button
                        onClick={() => setSelectedYear(y.year)}
                        className="w-full cursor-pointer px-4 py-1.5 text-right tabular-nums text-muted-foreground transition-colors hover:bg-muted"
                      >
                        {formatCurrency(y.incomeForYear)}
                      </button>
                    </td>
                    <td className="p-0">
                      <button
                        onClick={() => setSelectedYear(y.year)}
                        className="w-full cursor-pointer px-4 py-1.5 text-right tabular-nums text-card-foreground transition-colors hover:bg-muted"
                      >
                        {formatCurrency(y.totalForYear)}
                      </button>
                    </td>
                    <td className="p-0">
                      <button
                        onClick={() => setSelectedYear(y.year)}
                        className={`w-full cursor-pointer px-4 py-1.5 text-right font-medium tabular-nums transition-colors hover:bg-muted ${
                          y.balance < 0 ? "text-danger" : "text-card-foreground"
                        }`}
                      >
                        {formatCurrency(y.balance)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedYearPlan && (
        <YearDetailModal year={selectedYearPlan} onClose={() => setSelectedYear(null)} />
      )}
      {editingSavings && (
        <SavingsFormModal
          currentSavings={profile.currentSavings}
          onSave={handleSaveSavings}
          onClose={() => setEditingSavings(false)}
        />
      )}
    </div>
  );
}
