"use client";

import { useEffect, useState } from "react";
import type { CustomEvent } from "@/lib/types";
import {
  EVENT_PRESETS,
  PRESET_GROUPS,
  eventFromPreset,
  isInflow,
  type EventPreset,
} from "@/lib/eventPresets";
import { formatCurrency } from "@/lib/format";

interface EventPresetPickerProps {
  currentYear: number;
  /** Titles already on the timeline — those presets are shown as already added. */
  existingTitles: string[];
  onAdd: (events: CustomEvent[]) => void;
  onClose: () => void;
}

/** Per-preset state: ticked, and the year the user wants it to land on. */
interface Ticked {
  startYear: string;
}

function describeSpan(preset: EventPreset): string {
  if (!preset.recurring) return "one-time";
  if (preset.defaultYears === undefined) return "per year, ongoing";
  return `per year × ${preset.defaultYears} yrs`;
}

export default function EventPresetPicker({
  currentYear,
  existingTitles,
  onAdd,
  onClose,
}: EventPresetPickerProps) {
  const [ticked, setTicked] = useState<Record<string, Ticked>>({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function toggle(preset: EventPreset) {
    setTicked((prev) => {
      if (prev[preset.id]) {
        const next = { ...prev };
        delete next[preset.id];
        return next;
      }
      return { ...prev, [preset.id]: { startYear: String(currentYear) } };
    });
  }

  function setYear(presetId: string, startYear: string) {
    setTicked((prev) =>
      prev[presetId] ? { ...prev, [presetId]: { startYear } } : prev,
    );
  }

  function handleAdd() {
    const events = EVENT_PRESETS.filter((p) => ticked[p.id]).map((p) => {
      const parsed = Number(ticked[p.id].startYear);
      return eventFromPreset(p, Number.isInteger(parsed) ? parsed : currentYear);
    });
    if (events.length > 0) onAdd(events);
  }

  const needle = query.trim().toLowerCase();
  const matches = (p: EventPreset) =>
    needle === "" ||
    p.title.toLowerCase().includes(needle) ||
    p.group.toLowerCase().includes(needle) ||
    p.note.toLowerCase().includes(needle);

  const tickedIds = Object.keys(ticked);
  const tickedTotal = EVENT_PRESETS.filter((p) => ticked[p.id]).reduce(
    (sum, p) => sum + p.average,
    0,
  );

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preset-picker-heading"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border px-6 pt-6 pb-4">
          <h2
            id="preset-picker-heading"
            className="text-lg font-semibold text-card-foreground"
          >
            Common life events
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Tick anything that applies and it lands on your timeline at the
            average price shown. Averages are a starting point, not a quote —
            edit any event once you know your own number.
          </p>

          <input
            className={`${inputClass} mt-4`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events…"
            aria-label="Search events"
          />
        </div>

        {/* Scrolling catalog */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {PRESET_GROUPS.map((group) => {
            const items = EVENT_PRESETS.filter(
              (p) => p.group === group && matches(p),
            );
            if (items.length === 0) return null;

            return (
              <section key={group} className="mb-5 last:mb-0">
                <h3 className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {group}
                </h3>
                <div className="overflow-hidden rounded-lg border border-border">
                  {items.map((preset, i) => {
                    const isTicked = Boolean(ticked[preset.id]);
                    const alreadyAdded = existingTitles.includes(preset.title);
                    const inflow = isInflow(preset);

                    return (
                      <div
                        key={preset.id}
                        className={`${i > 0 ? "border-t border-border" : ""} ${
                          isTicked ? "bg-muted/60" : ""
                        }`}
                      >
                        <label className="flex cursor-pointer items-start gap-3 px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={isTicked}
                            onChange={() => toggle(preset)}
                            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                              <span className="text-sm text-card-foreground">
                                {preset.title}
                                {alreadyAdded && (
                                  <span className="ml-2 text-[11px] text-muted-foreground">
                                    already added
                                  </span>
                                )}
                              </span>
                              <span
                                className={`shrink-0 text-sm font-medium tabular-nums ${
                                  inflow ? "text-success" : "text-card-foreground"
                                }`}
                              >
                                {inflow ? "+" : ""}
                                {formatCurrency(Math.abs(preset.average))}
                              </span>
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {describeSpan(preset)} · average
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {preset.note}
                            </span>
                          </span>
                        </label>

                        {isTicked && (
                          <div className="flex items-center gap-2 border-t border-border/60 px-3 py-2 pl-10">
                            <label
                              className="text-xs text-muted-foreground"
                              htmlFor={`year-${preset.id}`}
                            >
                              {preset.recurring ? "Starts" : "Year"}
                            </label>
                            <input
                              id={`year-${preset.id}`}
                              type="number"
                              inputMode="numeric"
                              value={ticked[preset.id].startYear}
                              onChange={(e) => setYear(preset.id, e.target.value)}
                              className="w-24 rounded-md border border-border bg-background px-2 py-1 text-xs tabular-nums text-foreground focus:border-primary focus:outline-none"
                            />
                            {preset.recurring &&
                              preset.defaultYears !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  through{" "}
                                  {(Number(ticked[preset.id].startYear) || currentYear) +
                                    preset.defaultYears -
                                    1}
                                </span>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {EVENT_PRESETS.filter(matches).length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No events match “{query}”.
            </p>
          )}
        </div>

        {/* Footer: running total + actions */}
        <div className="shrink-0 border-t border-border px-6 py-4">
          {tickedIds.length > 0 && (
            <p className="mb-3 text-xs text-muted-foreground">
              {tickedIds.length} selected ·{" "}
              <span
                className={
                  tickedTotal < 0
                    ? "font-medium text-success"
                    : "font-medium text-card-foreground"
                }
              >
                {formatCurrency(tickedTotal)}
              </span>{" "}
              in first-year impact (recurring items repeat)
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-lg border-2 border-primary px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={tickedIds.length === 0}
              className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {tickedIds.length === 0
                ? "Add events"
                : `Add ${tickedIds.length} event${tickedIds.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
