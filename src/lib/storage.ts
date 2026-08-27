import { type AppState, SCHEMA_VERSION, createEmptyState, normalizeState } from "./types";
import { seedCategories } from "./seedCategories";

const STORAGE_KEY = "lifesavingsstep:state";

/** Minimal shape check — not a full schema validator, just enough to avoid
 * crashing on a corrupted or foreign localStorage value. Deliberately does
 * NOT require every current field (e.g. incomeSources) — normalizeState()
 * backfills those, so data saved by an older schema version isn't discarded. */
function isAppState(value: unknown): value is AppState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.schemaVersion === "number" &&
    Array.isArray(v.categories) &&
    Array.isArray(v.events) &&
    (v.profile === null || typeof v.profile === "object")
  );
}

/** Reads the persisted state. Returns a fresh default (seeded categories,
 * no profile) if nothing is stored yet or the stored value is unreadable. */
export function loadState(): AppState {
  if (typeof window === "undefined") return createEmptyState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    const parsed = JSON.parse(raw);
    if (!isAppState(parsed)) {
      console.warn("[storage] Stored state failed validation, starting fresh.");
      return defaultState();
    }
    return normalizeState(parsed);
  } catch (err) {
    console.warn("[storage] Failed to read stored state, starting fresh.", err);
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("[storage] Failed to save state — changes will not persist.", err);
  }
}

export function defaultState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: null,
    categories: seedCategories(),
    events: [],
    incomeSources: [],
  };
}
