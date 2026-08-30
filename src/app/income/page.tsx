"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/hooks/useAppState";
import IncomeFormModal from "@/components/IncomeFormModal";
import type { IncomeSource } from "@/lib/types";
import { isIncomeActiveInMonth, monthlyIncomeAmount, totalMonthlyIncome } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function describeSpan(source: IncomeSource): string {
  const start = `${MONTH_ABBR[source.startMonth - 1]} ${source.startYear}`;
  const end =
    source.endYear !== undefined
      ? `${MONTH_ABBR[(source.endMonth ?? 12) - 1]} ${source.endYear}`
      : "ongoing";
  return `${start} – ${end}`;
}

function isUpcoming(source: IncomeSource): boolean {
  return (
    source.startYear > CURRENT_YEAR ||
    (source.startYear === CURRENT_YEAR && source.startMonth > CURRENT_MONTH)
  );
}

export default function IncomePage() {
  const { state, setState, isLoaded } = useAppState();
  const [editing, setEditing] = useState<IncomeSource | "new" | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isLoaded || !state) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!state.profile) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background px-6 text-center">
        <p className="text-muted-foreground">
          Set up your timeline first — <Link href="/" className="text-primary underline">back to the dashboard</Link>.
        </p>
      </div>
    );
  }

  function handleSave(source: IncomeSource) {
    if (!state) return;
    const exists = state.incomeSources.some((s) => s.id === source.id);
    const incomeSources = exists
      ? state.incomeSources.map((s) => (s.id === source.id ? source : s))
      : [...state.incomeSources, source];
    setState({ ...state, incomeSources });
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!state) return;
    setState({ ...state, incomeSources: state.incomeSources.filter((s) => s.id !== id) });
    setConfirmDeleteId(null);
  }

  const editingSource = editing === "new" ? undefined : editing ?? undefined;
  const showForm = editing !== null;
  const total = totalMonthlyIncome(state, CURRENT_YEAR, CURRENT_MONTH);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back to timeline"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M12 15l-5-5 5-5"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-semibold text-foreground">Income</h1>
            <p className="text-xs text-muted-foreground">
              {state.incomeSources.length} source{state.incomeSources.length === 1 ? "" : "s"} ·{" "}
              {formatCurrency(total)}/mo active now
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setConfirmDeleteId(null);
            setEditing("new");
          }}
          className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          + Add income source
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-3">
          {state.incomeSources.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No income sources yet. Add a job, a freelance project, or any
              recurring income — each can be a monthly amount or an hourly
              rate, with a start/end period.
            </p>
          ) : (
            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="divide-y divide-border">
                {state.incomeSources.map((source) => {
                  const active = isIncomeActiveInMonth(source, CURRENT_YEAR, CURRENT_MONTH);
                  return (
                    <div
                      key={source.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-card-foreground">
                          {source.name}
                          {!active && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              ({isUpcoming(source) ? "upcoming" : "ended"})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {source.rateUnit === "monthly"
                            ? `${formatCurrency(source.amount)}/mo`
                            : `${formatCurrency(source.amount)}/hr${
                                source.hoursPerWeek !== undefined
                                  ? ` · ${source.hoursPerWeek} hrs/wk ≈ ${formatCurrency(
                                      monthlyIncomeAmount(source),
                                    )}/mo`
                                  : " · add hours/week to include in total"
                              }`}
                          {" · "}
                          {describeSpan(source)}
                          {source.growthRatePerYear !== 0 &&
                            ` · +${source.growthRatePerYear}%/yr`}
                          {source.epfApplies && " · EPF"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => {
                            setConfirmDeleteId(null);
                            setEditing(source);
                          }}
                          className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-muted"
                        >
                          Edit
                        </button>
                        {confirmDeleteId === source.id ? (
                          <button
                            onClick={() => handleDelete(source.id)}
                            className="cursor-pointer rounded-md bg-danger px-2 py-1 text-xs font-medium text-on-destructive"
                          >
                            Confirm?
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(source.id)}
                            className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-danger"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Active now
                </span>
                <span className="text-sm font-semibold text-card-foreground">
                  {formatCurrency(total)}/mo
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <IncomeFormModal
          source={editingSource}
          currentYear={CURRENT_YEAR}
          currentMonth={CURRENT_MONTH}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
