"use client";

import { useEffect } from "react";
import type { YearPlan } from "@/lib/calculations";
import { CATEGORY_GROUPS } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface YearDetailModalProps {
  year: YearPlan;
  onClose: () => void;
}

export default function YearDetailModal({ year, onClose }: YearDetailModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const groups = CATEGORY_GROUPS.map((group) => ({
    group,
    items: year.categoryAmounts.filter((c) => c.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-8 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="year-detail-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Age {year.age}</p>
            <h2 id="year-detail-heading" className="text-2xl font-semibold text-card-foreground">
              {year.year}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-border bg-background p-3">
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p
              className={`mt-0.5 truncate text-lg font-semibold ${
                year.balance < 0 ? "text-danger" : "text-success"
              }`}
            >
              {formatCurrency(year.balance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="mt-0.5 truncate text-lg font-semibold text-card-foreground">
              {formatCurrency(year.incomeForYear)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Needed</p>
            <p className="mt-0.5 truncate text-lg font-semibold text-card-foreground">
              {formatCurrency(year.totalForYear)}
            </p>
          </div>
        </div>

        {(year.incomeAmounts.length > 0 || year.epfBalance > 0) && (
          <div className="mt-6">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Income
            </h3>
            <ul className="mt-2 space-y-1.5">
              {year.incomeAmounts.map((i) => (
                <li key={i.sourceId} className="flex items-center justify-between text-sm">
                  <span className="min-w-0 truncate text-card-foreground">
                    {i.name}
                    {i.gross !== i.spendable && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatCurrency(i.gross)} gross
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-medium text-card-foreground">
                    {formatCurrency(i.spendable)}
                  </span>
                </li>
              ))}
            </ul>

            {(year.epfContributionForYear > 0 || year.epfBalance > 0 || year.epfReleased > 0) && (
              <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
                {year.epfContributionForYear > 0 && (
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Into EPF this year</span>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency(year.epfContributionForYear)}
                    </span>
                  </p>
                )}
                {year.epfReleased > 0 ? (
                  <p className="flex items-center justify-between">
                    <span className="text-success">EPF released to savings</span>
                    <span className="font-medium text-success">
                      {formatCurrency(year.epfReleased)}
                    </span>
                  </p>
                ) : (
                  year.epfBalance > 0 && (
                    <p className="flex items-center justify-between">
                      <span className="text-muted-foreground">EPF pot (locked)</span>
                      <span className="font-medium text-muted-foreground">
                        {formatCurrency(year.epfBalance)}
                      </span>
                    </p>
                  )
                )}
                <p className="flex items-center justify-between border-t border-border pt-1.5">
                  <span className="text-card-foreground">Total net worth</span>
                  <span className="font-medium text-card-foreground">
                    {formatCurrency(year.totalNetWorth)}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {groups.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Categories
            </h3>
            <div className="mt-2 divide-y divide-border">
              {groups.map(({ group, items }) => (
                <div key={group} className="py-3">
                  <p className="text-xs font-medium text-muted-foreground">{group}</p>
                  <ul className="mt-1.5 space-y-1.5">
                    {items.map((c) => (
                      <li key={c.categoryId} className="flex items-center justify-between text-sm">
                        <span className="text-card-foreground">{c.name}</span>
                        <span className="font-medium text-card-foreground">
                          {formatCurrency(c.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Life events
          </h3>
          {year.eventAmounts.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">None this year.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {year.eventAmounts.map((e) => (
                <li key={e.eventId} className="flex items-center justify-between text-sm">
                  <span className="text-card-foreground">{e.title}</span>
                  <span
                    className={`font-medium ${e.amount >= 0 ? "text-card-foreground" : "text-success"}`}
                  >
                    {formatCurrency(e.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
