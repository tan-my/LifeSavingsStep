"use client";

import { useCallback, useSyncExternalStore } from "react";
import { type AppState } from "@/lib/types";
import { defaultState, loadState, saveState } from "@/lib/storage";

// Module-level cache so the store is shared across every component that
// calls useAppState(), and so getSnapshot() can return a stable reference
// (useSyncExternalStore requires that, or it re-renders in a loop).
let cachedState: AppState | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): AppState | null {
  if (cachedState === null) {
    cachedState = loadState();
  }
  return cachedState;
}

// The server has no localStorage — render the loading state during SSR and
// let the client take over on hydration via getSnapshot() above.
function getServerSnapshot(): AppState | null {
  return null;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function commit(next: AppState) {
  cachedState = next;
  saveState(next);
  listeners.forEach((listener) => listener());
}

/**
 * Reads AppState from localStorage (client-only) and keeps every subscribed
 * component in sync. Returns `state: null` during SSR / before the client
 * has loaded — callers should render a loading state for that case.
 */
export function useAppState() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setState = useCallback((next: AppState) => {
    commit(next);
  }, []);

  const resetToDefault = useCallback(() => {
    commit(defaultState());
  }, []);

  return { state, setState, resetToDefault, isLoaded: state !== null };
}
