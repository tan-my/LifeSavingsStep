"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/hooks/useAppState";
import EventFormModal from "@/components/EventFormModal";
import type { CustomEvent } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

const CURRENT_YEAR = new Date().getFullYear();

function isUpcomingOrOngoing(event: CustomEvent): boolean {
  if (!event.recurring) return event.startYear >= CURRENT_YEAR;
  return event.endYear === undefined || event.endYear >= CURRENT_YEAR;
}

function describeSpan(event: CustomEvent): string {
  if (!event.recurring) return String(event.startYear);
  return `${event.startYear} – ${event.endYear ?? "ongoing"}`;
}

export default function EventsPage() {
  const { state, setState, isLoaded } = useAppState();
  const [editing, setEditing] = useState<CustomEvent | "new" | null>(null);
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

  function handleSave(event: CustomEvent) {
    if (!state) return;
    const exists = state.events.some((e) => e.id === event.id);
    const events = exists
      ? state.events.map((e) => (e.id === event.id ? event : e))
      : [...state.events, event];
    setState({ ...state, events });
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!state) return;
    setState({ ...state, events: state.events.filter((e) => e.id !== id) });
    setConfirmDeleteId(null);
  }

  const editingEvent = editing === "new" ? undefined : editing ?? undefined;
  const showForm = editing !== null;

  const sorted = [...state.events].sort((a, b) => a.startYear - b.startYear);
  const groups: { label: string; items: CustomEvent[] }[] = [
    { label: "Upcoming / ongoing", items: sorted.filter(isUpcomingOrOngoing) },
    { label: "Past", items: sorted.filter((e) => !isUpcomingOrOngoing(e)) },
  ];

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
            <h1 className="text-base font-semibold text-foreground">Life events</h1>
            <p className="text-xs text-muted-foreground">{state.events.length} total</p>
          </div>
        </div>
        <button
          onClick={() => {
            setConfirmDeleteId(null);
            setEditing("new");
          }}
          className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          + Add event
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-3">
          {state.events.length === 0 && (
            <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No life events yet. Add a wedding, a new baby, buying a house — anything
              that shifts the numbers on top of your category baseline.
            </p>
          )}

          {groups.map(
            ({ label, items }) =>
              items.length > 0 && (
                <details
                  key={label}
                  open
                  className="rounded-lg border border-border bg-card shadow-sm"
                >
                  <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-2.5">
                    <span className="text-sm font-medium text-card-foreground">
                      {label}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({items.length})
                      </span>
                    </span>
                  </summary>

                  <div className="divide-y divide-border border-t border-border">
                    {items.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between gap-3 px-4 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-card-foreground">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {describeSpan(event)}
                            {event.recurring && " · per year"}
                            {" · "}
                            <span
                              className={event.amount < 0 ? "text-success" : undefined}
                            >
                              {formatCurrency(event.amount)}
                            </span>
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            onClick={() => {
                              setConfirmDeleteId(null);
                              setEditing(event);
                            }}
                            className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-muted"
                          >
                            Edit
                          </button>
                          {confirmDeleteId === event.id ? (
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="cursor-pointer rounded-md bg-danger px-2 py-1 text-xs font-medium text-on-destructive"
                            >
                              Confirm?
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(event.id)}
                              className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-danger"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ),
          )}
        </div>
      </div>

      {showForm && (
        <EventFormModal
          event={editingEvent}
          currentYear={CURRENT_YEAR}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
