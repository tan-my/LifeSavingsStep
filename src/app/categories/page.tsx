"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/hooks/useAppState";
import CategoryFormModal from "@/components/CategoryFormModal";
import { CATEGORY_GROUPS, type Category, type CategoryGroup } from "@/lib/types";
import { annualBaseAmount } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";

export default function CategoriesPage() {
  const { state, setState, isLoaded } = useAppState();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [newInGroup, setNewInGroup] = useState<CategoryGroup | undefined>();
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

  function handleSave(category: Category) {
    if (!state) return;
    const exists = state.categories.some((c) => c.id === category.id);
    const categories = exists
      ? state.categories.map((c) => (c.id === category.id ? category : c))
      : [...state.categories, category];
    setState({ ...state, categories });
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!state) return;
    setState({ ...state, categories: state.categories.filter((c) => c.id !== id) });
    setConfirmDeleteId(null);
  }

  const editingCategory = editing === "new" ? undefined : editing ?? undefined;
  const showForm = editing !== null;

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
            <h1 className="text-base font-semibold text-foreground">Categories</h1>
            <p className="text-xs text-muted-foreground">{state.categories.length} total</p>
          </div>
        </div>
        <button
          onClick={() => {
            setConfirmDeleteId(null);
            setNewInGroup(undefined);
            setEditing("new");
          }}
          className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          + Add category
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-3">
          {CATEGORY_GROUPS.map((group) => {
            const items = state.categories.filter((c) => c.group === group);
            const groupAnnualTotal = items.reduce((sum, c) => sum + annualBaseAmount(c), 0);

            return (
              <details
                key={group}
                open
                className="rounded-lg border border-border bg-card shadow-sm"
              >
                <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-2.5">
                  <span className="text-sm font-medium text-card-foreground">
                    {group}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({items.length})
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(groupAnnualTotal)}/yr
                  </span>
                </summary>

                <div className="divide-y divide-border border-t border-border">
                  {items.length === 0 && (
                    <p className="px-4 py-3 text-sm text-muted-foreground">
                      No categories in this group yet.
                    </p>
                  )}
                  {items.map((category) => (
                    <div key={category.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-card-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(category.baseAmount)} / {category.amountUnit === "monthly" ? "mo" : "yr"}
                          {category.growthRatePerYear !== 0 && ` · +${category.growthRatePerYear}%/yr`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => {
                            setConfirmDeleteId(null);
                            setEditing(category);
                          }}
                          className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-muted"
                        >
                          Edit
                        </button>
                        {confirmDeleteId === category.id ? (
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="cursor-pointer rounded-md bg-danger px-2 py-1 text-xs font-medium text-on-destructive"
                          >
                            Confirm?
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(category.id)}
                            className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-danger"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setConfirmDeleteId(null);
                      setNewInGroup(group);
                      setEditing("new");
                    }}
                    className="w-full cursor-pointer px-4 py-2 text-left text-xs font-medium text-primary transition-colors hover:bg-muted"
                  >
                    + Add to {group}
                  </button>
                </div>
              </details>
            );
          })}
        </div>
      </div>

      {showForm && (
        <CategoryFormModal
          category={editingCategory}
          defaultGroup={newInGroup}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
